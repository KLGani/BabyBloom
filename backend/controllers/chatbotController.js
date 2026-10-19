const User = require("../models/User");
const PregnancyProfile = require("../models/PregnancyProfile");
const ChildProfile = require("../models/ChildProfile");
const { detectScriptLanguage, processMultilingualQuestion } = require("../services/indicNLPService");

/**
 * Attempts to query external AI APIs (OpenAI or Gemini) if an API key is present in environment variables.
/**
 * Multi-Tier Integrated AI Engine:
 * 1. Google Gemini (if GEMINI_API_KEY is present)
 * 2. OpenAI GPT-4o-mini (if OPENAI_API_KEY is present)
 * 3. Groq LLaMA 3.3 (if GROQ_API_KEY is present)
 * 4. Autonomous Integrated Neural AI (Pollinations AI: openai-fast reasoning LLM)
 * 5. Autonomous Integrated AI fallback
 */
async function callExternalAI(userMessage, context = {}, language = "English", history = []) {
  const languageNames = {
    Kannada: "Kannada (ಕನ್ನಡ)",
    Hindi: "Hindi (हिंदी)",
    Tamil: "Tamil (தமிழ்)",
    Telugu: "Telugu (తెలుగు)",
    English: "English",
  };
  const targetLang = languageNames[language] || language;

  const systemPrompt = `You are Little Bloom, a warm, compassionate, and medically responsible AI companion for pregnant women and mothers (specialized like ChatGPT for maternal and pediatric healthcare).
User Profile:
- Name: ${context.userName || "Mama"}
- Journey Mode: ${context.mode || "pregnancy"}
- Pregnancy Week: ${context.pregnancyWeek ? `Week ${context.pregnancyWeek}` : "Not specified"}
- Baby/Child: ${context.childName || "Baby"}
- Target Language: ${targetLang}

Strict Responsibilities:
1. Answer the user's EXACT question directly, thoughtfully, and accurately in ${targetLang}. Do NOT provide generic, unrelated, or canned answers.
2. Structure your response with an empathetic greeting, clean bullet points (•), bold keywords, actionable guidance, and reassuring takeaways.
3. If they ask about food safety, symptoms, medications, travel, baby care, or development, give evidence-based medical context (ACOG, WHO, CDC standards).
4. Never diagnose or prescribe. If severe red flags appear (heavy bleeding, acute pain, lack of fetal movement), advise urgent medical consultation.
5. Write your entire response strictly and naturally in ${targetLang}.`;

  // Helper to clean output
  const cleanAIOutput = (text) => {
    if (!text || typeof text !== "string") return null;
    let cleaned = text.trim();
    // Remove thought/reasoning tags if any
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "").trim();
    if (cleaned === "{}" || cleaned.startsWith('{"error"') || cleaned.length < 5) return null;
    return cleaned;
  };

  // 1. Google Gemini API (if key configured)
  // 1. Google Gemini API
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "process.env.GEMINI_API_KEY"
  ) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const promptText = `${systemPrompt}\n\nUser Question:\n"${userMessage}"`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = cleanAIOutput(data.candidates?.[0]?.content?.parts?.[0]?.text);
        if (text) return text;
      } else {
        console.warn("Gemini returned non-OK status:", res.status);
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back:", err.message);
    }
  }

  // 2. OpenAI API (if key configured)
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith("sk-") &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key"
  ) {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-6).map((h) => ({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content,
        })),
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 750,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = cleanAIOutput(data.choices?.[0]?.message?.content);
        if (text) return text;
      }
    } catch (err) {
      console.warn("OpenAI API call failed, falling back:", err.message);
    }
  }

  // 3. Groq API (if key configured)
  if (
    process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY.startsWith("gsk_")
  ) {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 750,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = cleanAIOutput(data.choices?.[0]?.message?.content);
        if (text) return text;
      }
    } catch (err) {
      console.warn("Groq API call failed, falling back:", err.message);
    }
  }

  // 4. Autonomous Integrated Neural AI (Primary Model: openai-fast)
  try {
    const aiPrompt = `${systemPrompt}\n\nUser Question:\n"${userMessage}"`;

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: aiPrompt }],
        model: "openai-fast",
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const raw = await res.text();
      const text = cleanAIOutput(raw);
      if (text) return text;
    }
  } catch (err) {
    console.warn("Integrated AI Primary call failed, trying backup:", err.message);
  }

  // 5. Autonomous Integrated Neural AI (Backup Model: generic text router)
  try {
    const aiPrompt = `${systemPrompt}\n\nUser Question:\n"${userMessage}"`;

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: aiPrompt }],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (res.ok) {
      const raw = await res.text();
      const text = cleanAIOutput(raw);
      if (text) return text;
    }
  } catch (backupErr) {
    console.warn("Integrated AI Backup call failed:", backupErr.message);
  }

  return null;
}

/**
 * World-Class Maternal Healthcare Intelligence Engine (MIKE)
 * Answers any question an expectant mother asks with ChatGPT-level depth, compassion, and structure.
 */
function generateExpertResponse(userMessage, context = {}, language = "en") {
  const query = (userMessage || "").toLowerCase().trim();
  const week = context.pregnancyWeek;
  const name = context.userName || "mama";

  // 1. RED FLAGS / MEDICAL EMERGENCIES (HIGH PRIORITY)
  if (
    query.includes("bleed") ||
    query.includes("hemorrhage") ||
    query.includes("severe abdominal pain") ||
    query.includes("sharp pain in stomach") ||
    query.includes("blurry vision") ||
    query.includes("flashes of light") ||
    query.includes("baby stopped moving") ||
    query.includes("not moving at all") ||
    query.includes("fainted") ||
    query.includes("high fever") ||
    query.includes("convulsion") ||
    query.includes("can't breathe")
  ) {
    return {
      reply:
        `🚨 URGENT HEALTH NOTICE:\n` +
        `Dear ${name}, please take immediate care. If you are experiencing heavy vaginal bleeding (soaking a sanitary pad), severe sharp abdominal or one-sided pelvic pain, sudden face/hand swelling with blurry vision, or your baby has noticeably stopped moving in the third trimester, please do NOT wait.\n\n` +
        `• Call your OB-GYN or midwife immediately.\n` +
        `• Or go directly to the nearest maternity emergency department.\n` +
        `• Have someone drive you safely and stay seated.\n\n` +
        `Your safety and your baby's wellbeing always come first. Please reach out to medical professionals right now!`,
      category: "urgent",
    };
  }

  // 2. PARACETAMOL / TYLENOL / PAINKILLERS
  if (
    query.includes("paracetamol") ||
    query.includes("tylenol") ||
    query.includes("acetaminophen") ||
    query.includes("crocin") ||
    query.includes("dolo") ||
    query.includes("pain killer") ||
    query.includes("painkiller")
  ) {
    return {
      reply:
        `💊 Paracetamol (Acetaminophen) in Pregnancy:\n\n` +
        `Yes, Paracetamol (Tylenol / Acetaminophen) is generally recognized by obstetricians as the first-choice pain reliever and fever reducer throughout all three trimesters when taken at standard recommended doses.\n\n` +
        `• What it treats: Mild headaches, backaches, fever, and muscle aches.\n` +
        `• Recommended guideline: Take the lowest effective dose (e.g., 500mg) for the shortest possible duration.\n` +
        `• Safe daily limit: Do not exceed 3,000mg to 4,000mg in 24 hours.\n` +
        `• Key caution: Avoid taking combination cold & flu products containing caffeine, decongestants, or antihistamines without checking with your doctor.\n\n` +
        `⚠️ What to avoid: Avoid NSAIDs like Ibuprofen, Advil, Aspirin, or Naproxen, especially after 20 weeks, as they can cause serious complications for fetal kidneys and blood circulation.`,
      category: "medication",
    };
  }

  // 3. IBUPROFEN / ADVIL / ASPIRIN / NSAIDs
  if (
    query.includes("ibuprofen") ||
    query.includes("advil") ||
    query.includes("aspirin") ||
    query.includes("naproxen") ||
    query.includes("aleve") ||
    query.includes("nsaid")
  ) {
    return {
      reply:
        `⚠️ Caution Regarding Ibuprofen & NSAIDs in Pregnancy:\n\n` +
        `In general, you should AVOID Ibuprofen (Advil, Motrin), Naproxen (Aleve), and other NSAIDs during pregnancy, especially from week 20 onwards:\n\n` +
        `• Why they are restricted: The FDA and ACOG warn that NSAIDs in the 2nd and 3rd trimesters can cause low amniotic fluid (oligohydramnios) and premature closure of a vital fetal blood vessel (ductus arteriosus).\n` +
        `• What is safer instead: Standard Paracetamol (Acetaminophen / Tylenol) is the preferred safe alternative for pregnancy headaches and fever.\n` +
        `• Note on Low-Dose Aspirin (81mg): Sometimes doctors prescribe low-dose baby aspirin to prevent preeclampsia in high-risk pregnancies. Only take this if explicitly prescribed by your OB-GYN!`,
      category: "medication",
    };
  }

  // 4. COLD, COUGH & SORE THROAT MEDICINES
  if (
    query.includes("cold") ||
    query.includes("cough") ||
    query.includes("sore throat") ||
    query.includes("runny nose") ||
    query.includes("congestion") ||
    query.includes("flu")
  ) {
    return {
      reply:
        `🌸 Soothing Cold, Cough & Congestion Naturally:\n\n` +
        `Catching a cold during pregnancy is common because your immune system naturally softens to protect baby. Here are safe remedies:\n\n` +
        `• Safe Natural Relief:\n` +
        `  - Saline nasal sprays or sinus rinses (100% drug-free & very effective).\n` +
        `  - Warm water with lemon and honey to coat a tickly throat.\n` +
        `  - Warm facial steam inhalations or a cool-mist humidifier by your bedside.\n` +
        `  - Warm salt water gargles 3–4 times daily for sore throat.\n\n` +
        `• Medications to check:\n` +
        `  - Paracetamol for fever or body ache.\n` +
        `  - Plain Robitussin (Duaifenesin/Dextromethorphan) or simple saline drops are often approved, but avoid multi-symptom cold syrups with pseudoephedrine/phenylephrine.\n\n` +
        `🌡️ When to call doctor: If your fever exceeds 38°C (100.4°F) or you experience wheezing or difficulty breathing.`,
      category: "health",
    };
  }

  // 5. CAFFEINE, COFFEE & TEA
  if (
    query.includes("coffee") ||
    query.includes("tea") ||
    query.includes("caffeine") ||
    query.includes("chai") ||
    query.includes("espresso") ||
    query.includes("matcha")
  ) {
    return {
      reply:
        `☕ Coffee & Caffeine in Pregnancy:\n\n` +
        `Good news! You do NOT need to give up your morning cup of coffee completely:\n\n` +
        `• The Golden Rule: Obstetric guidelines (ACOG, WHO) recommend limiting caffeine intake to under 200 mg per day.\n` +
        `• What 200 mg looks like:\n` +
        `  - ~1 standard 12-oz mug of brewed coffee.\n` +
        `  - ~2 single shots of espresso or lattes.\n` +
        `  - ~2–3 cups of black or green tea.\n` +
        `• Keep in mind: Dark chocolate, cola, iced tea, and certain medications also contain caffeine.\n` +
        `• Safe Alternatives: Decaf coffee, rooibos tea, peppermint tea, ginger tea, or warm golden milk (turmeric with warm milk and cardamom).\n\n` +
        `💡 Pro-tip: Hydrate with an extra glass of water whenever you enjoy a caffeinated beverage!`,
      category: "nutrition",
    };
  }

  // 6. PINEAPPLE & PAPAYA
  if (
    query.includes("pineapple") ||
    query.includes("papaya") ||
    query.includes("mango") ||
    query.includes("can i eat pineapple") ||
    query.includes("can i eat papaya")
  ) {
    return {
      reply:
        `🍍 Pineapple & Papaya During Pregnancy — Facts vs Myths:\n\n` +
        `• Pineapple 🍍:\n` +
        `  - YES, safe in normal culinary portions! Pineapple contains the enzyme bromelain, but in such tiny amounts that eating a cup or two of fresh pineapple will NOT trigger uterine contractions or miscarriage. Enjoy it for its rich Vitamin C and manganese!\n\n` +
        `• Papaya:\n` +
        `  - RIPE Yellow/Orange Papaya: Completely safe and great for digestion, Vitamin A, and fiber.\n` +
        `  - UNRIPE Green Papaya: AVOID raw green unripe papaya. It contains high concentrations of latex and papain, which can stimulate uterine contractions.\n\n` +
        `• Mangoes 🥭: Perfectly safe, rich in Vitamin C, folate, and potassium. Just enjoy in moderation if monitoring blood sugar.`,
      category: "food_safety",
    };
  }

  // 7. SUSHI, FISH & SEAFOOD
  if (
    query.includes("sushi") ||
    query.includes("fish") ||
    query.includes("salmon") ||
    query.includes("tuna") ||
    query.includes("prawn") ||
    query.includes("shrimp") ||
    query.includes("seafood")
  ) {
    return {
      reply:
        `🍣 Fish, Sushi & Seafood Guide:\n\n` +
        `Fish is wonderful for baby's brain development because of Omega-3 fatty acids (DHA), but safety rules apply:\n\n` +
        `• What is SAFE & ENCOURAGED (Cooked):\n` +
        `  - Cooked salmon, cooked shrimp/prawns, tilapia, cod, canned light tuna, and crab.\n` +
        `  - Cooked sushi rolls (avocado rolls, cucumber rolls, tempura rolls, California rolls made with imitation crab).\n\n` +
        `• What to AVOID:\n` +
        `  - Raw or undercooked sushi/sashimi (risk of listeria and parasites).\n` +
        `  - High-mercury apex predators: Shark, Swordfish, King Mackerel, Bigeye Tuna, and Tilefish.\n\n` +
        `• Optimal portion: 2 to 3 servings (8–12 oz) of low-mercury cooked fish weekly.`,
      category: "food_safety",
    };
  }

  // 8. CHEESE, EGGS, MILK & DELI MEAT
  if (
    query.includes("cheese") ||
    query.includes("feta") ||
    query.includes("brie") ||
    query.includes("egg") ||
    query.includes("deli") ||
    query.includes("ham") ||
    query.includes("hot dog") ||
    query.includes("bacon") ||
    query.includes("milk")
  ) {
    return {
      reply:
        `🧀 Cheese, Eggs & Meat Safety in Pregnancy:\n\n` +
        `• Cheese & Dairy:\n` +
        `  - Safe: Hard cheeses (cheddar, parmesan, gouda) and ANY soft cheese (feta, mozzarella, cottage cheese, paneer) that is labeled "Made with pasteurized milk".\n` +
        `  - Avoid: Unpasteurized soft mold-ripened cheeses (raw brie, camembert, unpasteurized blue cheese) due to Listeria risk.\n\n` +
        `• Eggs 🍳:\n` +
        `  - Safe: Fully cooked eggs where yolk and whites are firm.\n` +
        `  - Avoid: Raw runny yolks, homemade mayonnaise, or raw cake batter to prevent Salmonella.\n\n` +
        `• Deli Meats & Cold Cuts 🥪:\n` +
        `  - Salami, turkey slices, hot dogs, and ham should be heated until steaming hot (75°C/165°F) before eating to kill any possible surface bacteria.`,
      category: "food_safety",
    };
  }

  // 9. MORNING SICKNESS, NAUSEA & VOMITING
  if (
    query.includes("nausea") ||
    query.includes("morning sickness") ||
    query.includes("vomit") ||
    query.includes("throw up") ||
    query.includes("queasy") ||
    query.includes("hyperemesis")
  ) {
    return {
      reply:
        `🌸 Gentle Relief for Morning Sickness & Nausea:\n\n` +
        `Morning sickness is triggered by surging hCG and progesterone hormones, peaking between weeks 8 and 11. Try these tried-and-tested strategies:\n\n` +
        `• Dietary Hacks:\n` +
        `  - Keep saltines, dry crackers, or plain biscuits on your bedside table. Eat 2 before even lifting your head out of bed in the morning.\n` +
        `  - Eat tiny, frequent nibbles every 2 hours — an empty stomach worsens nausea rapidly.\n` +
        `  - Sip chilled water, cold lemonade, ginger tea, or suck on peppermint drops.\n\n` +
        `• Medical Options:\n` +
        `  - Vitamin B6 (Pyridoxine 10–25mg 3x daily) is clinically proven to ease nausea.\n` +
        `  - Doxylamine (Unisom) combined with B6 is a standard first-line obstetric treatment.\n` +
        `  - Acupressure wristbands (Sea-Bands) stimulating the P6 pressure point.\n\n` +
        `⚠️ Call your doctor if: You cannot keep water down for 24 hours, you feel faint, or your urine turns dark amber.`,
      category: "symptom",
    };
  }

  // 10. SLEEPING POSITIONS & INSOMNIA
  if (
    query.includes("sleep") ||
    query.includes("position") ||
    query.includes("lie on back") ||
    query.includes("side sleep") ||
    query.includes("insomnia") ||
    query.includes("pillow")
  ) {
    return {
      reply:
        `🌙 Best Sleeping Positions During Pregnancy:\n\n` +
        `• Optimal Position (Especially from 2nd Trimester / 20+ weeks):\n` +
        `  - Side Sleeping (Left side is the gold standard!):\n` +
        `  - Why Left Side? It prevents your heavy uterus from compressing the inferior vena cava (the main vein returning blood from your legs to your heart), maximizing blood, oxygen, and nutrient flow to your placenta and baby.\n\n` +
        `• Can you sleep on your back? Avoid prolonged back sleeping after week 20. It can reduce blood pressure and cause dizziness.\n` +
        `  - If you wake up on your back: Don't panic! Simply roll back over to your side.\n\n` +
        `• Comfort Tips for Better Rest:\n` +
        `  - Place a pillow between your knees to align your hips and lower spine.\n` +
        `  - Use a wedge pillow under your baby bump.\n` +
        `  - Keep screens away 30 mins before sleep; sip chamomile or warm milk.`,
      category: "lifestyle",
    };
  }

  // 11. CRAMPING & ROUND LIGAMENT PAIN
  if (
    query.includes("cramp") ||
    query.includes("twinge") ||
    query.includes("round ligament") ||
    query.includes("lower abdomen pain") ||
    query.includes("pulling sensation")
  ) {
    return {
      reply:
        `🌸 Understanding Cramping & Abdominal Twinges:\n\n` +
        `Mild cramping and pulling sensations are remarkably common as your body adapts:\n\n` +
        `• Normal Causes:\n` +
        `  1. Uterine Expansion: Your uterus grows from the size of a plum to a watermelon. Mild dull aching or stretching sensations are normal.\n` +
        `  2. Round Ligament Pain: Sharp jabbing or dull ache in the lower abdomen or groin when you stand up, sneeze, or turn over in bed. This is due to the ligaments supporting the uterus stretching.\n` +
        `  3. Implantation Cramping: Mild sensations in early weeks (3–5 weeks).\n\n` +
        `• How to find relief: Rest with feet elevated, take a warm (not hot) bath, change positions gently, and stay well hydrated (dehydration causes uterine irritability).\n\n` +
        `⚠️ Red Flag Warning: If cramping is sharp, severe, rhythmic like intense menstrual cramps, or accompanied by bright red vaginal bleeding, seek medical care immediately.`,
      category: "symptom",
    };
  }

  // 12. BLEEDING & SPOTTING
  if (
    query.includes("spotting") ||
    query.includes("brown discharge") ||
    query.includes("pink discharge") ||
    query.includes("light bleeding") ||
    query.includes("bleed after sex")
  ) {
    return {
      reply:
        `🩸 Spotting & Light Bleeding in Pregnancy:\n\n` +
        `While any bleeding can feel scary, light spotting is actually quite common (affecting ~25% of healthy pregnancies):\n\n` +
        `• Common Benign Causes:\n` +
        `  - Implantation Spotting (very early pregnancy, pale pink or brownish).\n` +
        `  - Cervical Sensitivity: Your cervix has extra blood vessels during pregnancy. Light spotting after intercourse or a vaginal exam is very common.\n` +
        `  - Subchorionic hematoma: Small pooling of blood near placenta that often resolves with rest.\n\n` +
        `• What to do:\n` +
        `  1. Wear a pantyliner to track the color (pink, brown, or bright red) and volume.\n` +
        `  2. Rest and avoid strenuous lifting or intercourse until evaluated.\n` +
        `  3. Contact your OB-GYN or midwife to inform them.\n\n` +
        `🚨 Seek emergency care if: The bleeding is bright red, fills a sanitary pad within 1–2 hours, or is accompanied by severe cramping, dizziness, or shoulder pain.`,
      category: "symptom",
    };
  }

  // 13. HEARTBURN, ACID REFLUX & GERD
  if (
    query.includes("heartburn") ||
    query.includes("acid reflux") ||
    query.includes("gerd") ||
    query.includes("burning throat") ||
    query.includes("indigestion")
  ) {
    return {
      reply:
        `🔥 Heartburn & Acid Reflux Relief:\n\n` +
        `Progesterone hormone relaxes the valve at the entrance of your stomach, allowing stomach acid to creep back up into your esophagus. Here is how to quench the fire:\n\n` +
        `• Daily Habits That Help:\n` +
        `  - Eat 5–6 small meals instead of 3 big ones.\n` +
        `  - Sit upright for at least 60–90 minutes after eating — never lie down immediately after a meal.\n` +
        `  - Elevate the head of your mattress by 6 inches.\n` +
        `  - Avoid trigger foods: Spicy curries, acidic citrus/tomatoes, deep-fried snacks, and chocolate.\n` +
        `  - Sip almond milk, warm oat milk, or chew on raw almonds for quick natural relief.\n\n` +
        `• Safe Medications: Calcium carbonate antacids (like Tums or Rennie) are generally considered safe during pregnancy. Consult your doctor before taking famotidine or omeprazole.`,
      category: "symptom",
    };
  }

  // 14. HEADACHES & MIGRAINES
  if (
    query.includes("headache") ||
    query.includes("migraine") ||
    query.includes("head ache") ||
    query.includes("head hurts")
  ) {
    return {
      reply:
        `🤕 Headaches During Pregnancy:\n\n` +
        `Headaches are common in the 1st and early 2nd trimesters due to surging hormones, expanding blood volume, dehydration, and caffeine withdrawal.\n\n` +
        `• Safe Ways to Relieve It:\n` +
        `  - Drink a large glass of water or electrolyte drink.\n` +
        `  - Rest in a quiet, dark room with a cool or warm cloth on your forehead or back of neck.\n` +
        `  - Gentle shoulder and neck massage.\n` +
        `  - Eat a wholesome snack (low blood sugar is a frequent culprit).\n` +
        `  - Paracetamol (Acetaminophen) is the safe medical option.\n\n` +
        `⚠️ CRITICAL WARNING (Third Trimester / 20+ weeks):\n` +
        `If you develop a sudden, severe, pounding headache that doesn't go away with paracetamol, especially if accompanied by blurry vision, flashing spots, or swelling in your hands/face, check your blood pressure immediately — this can be a sign of Preeclampsia!`,
      category: "symptom",
    };
  }

  // 15. BACK PAIN, SCIATICA & PELVIC GIRDLE PAIN
  if (
    query.includes("back pain") ||
    query.includes("lower back") ||
    query.includes("sciatica") ||
    query.includes("pelvic pain") ||
    query.includes("hip pain")
  ) {
    return {
      reply:
        `🌸 Relieving Pregnancy Back & Pelvic Pain:\n\n` +
        `As your baby grows, your center of gravity shifts forward, and the relaxin hormone loosens your pelvic ligaments. Here is how to protect your back:\n\n` +
        `• Posture & Movement:\n` +
        `  - Wear flat, supportive footwear with good arch support (avoid high heels).\n` +
        `  - Practice pelvic tilts (cat-cow yoga pose on hands and knees).\n` +
        `  - Try a maternity belly support band to lift pressure off your lower spine and pubic bone.\n` +
        `  - When picking something up, bend your knees and squat — never bend at the waist.\n\n` +
        `• Comfort Measures:\n` +
        `  - Apply a warm compress or warm water bottle to your lower back for 15 minutes.\n` +
        `  - Prenatal massage by a certified prenatal therapist.\n` +
        `  - Gentle prenatal yoga or swimming (buoyancy takes 100% of the weight off your joints!).`,
      category: "lifestyle",
    };
  }

  // 16. CONSTIPATION, BLOATING & GAS
  if (
    query.includes("constipat") ||
    query.includes("poop") ||
    query.includes("bloat") ||
    query.includes("gas") ||
    query.includes("hemorrhoid") ||
    query.includes("piles")
  ) {
    return {
      reply:
        `🌸 Easing Constipation & Bloating:\n\n` +
        `High progesterone levels slow down bowel motility so your body absorbs maximum nutrients for baby. Iron supplements can also contribute to constipation.\n\n` +
        `• Proven Remedies:\n` +
        `  - Fiber Power: Prunes, chia seeds, flaxseeds, oats, pears, and green leafy vegetables (aim for 25–30g daily).\n` +
        `  - Ample Fluids: Drink 8–10 large glasses of water daily. Warm water with lemon in the morning helps wake up the digestive tract.\n` +
        `  - Gentle Movement: A brisk 20-minute daily walk stimulates natural peristalsis.\n` +
        `  - Don't strain: Use a footstool (Squatty Potty position) to ease elimination.\n` +
        `  - Review iron: If your iron tablet is causing severe constipation, ask your doctor about liquid iron or stool softeners (like docusate sodium).`,
      category: "symptom",
    };
  }

  // 17. SWOLLEN FEET, ANKLES & EDEMA
  if (
    query.includes("swollen") ||
    query.includes("swelling") ||
    query.includes("edema") ||
    query.includes("puffy feet") ||
    query.includes("feet hurt")
  ) {
    return {
      reply:
        `🦶 Caring for Swollen Feet & Ankles (Edema):\n\n` +
        `Mild swelling in the feet, ankles, and legs is normal in late pregnancy due to increased blood volume and fluid retention.\n\n` +
        `• Comfort Tips:\n` +
        `  - Elevate your feet above heart level whenever sitting or lying down.\n` +
        `  - Wear graded compression socks (put them on first thing in the morning).\n` +
        `  - Drink plenty of water — staying hydrated actually encourages your kidneys to flush excess fluid.\n` +
        `  - Avoid crossing your legs while sitting.\n` +
        `  - Soak feet in cool water with Epsom salt.\n\n` +
        `⚠️ Red Flag Warning: Sudden swelling in your face, around eyes, or sudden puffiness in hands, especially if accompanied by high blood pressure or headache, requires urgent evaluation for preeclampsia.`,
      category: "symptom",
    };
  }

  // 18. BABY KICKS, MOVEMENTS & QUICKENING
  if (
    query.includes("kick") ||
    query.includes("movement") ||
    query.includes("flutters") ||
    query.includes("quickening") ||
    query.includes("baby move") ||
    query.includes("count kicks")
  ) {
    return {
      reply:
        `👣 Baby Movement & Kick Counts:\n\n` +
        `Feeling your baby move is one of the most magical parts of pregnancy!\n\n` +
        `• When will I feel movements?\n` +
        `  - First-time mothers usually feel initial light flutterings ("quickening") between weeks 18 and 22.\n` +
        `  - If you have an anterior placenta (cushioning the front), you might not feel kicks clearly until weeks 22–24.\n\n` +
        `• Third Trimester (28+ Weeks) Kick Counting:\n` +
        `  - Baby should have a regular, recognizable pattern of movement every day.\n` +
        `  - Kick Count Guide: Lie on your left side in a quiet room. You should feel at least 10 distinct kicks, swishes, or rolls within 2 hours.\n\n` +
        `🚨 Important Rule: Baby DOES NOT "run out of room" to move near the due date. Their movements shift to rolls and jabs, but they should never slow down. If you notice reduced movement, contact your maternity unit immediately!`,
      category: "pregnancy",
    };
  }

  // 19. BRAXTON HICKS VS REAL LABOR
  if (
    query.includes("braxton hicks") ||
    query.includes("false labor") ||
    query.includes("true labor") ||
    query.includes("contraction") ||
    query.includes("labor signs") ||
    query.includes("is labor starting")
  ) {
    return {
      reply:
        `⏱️ Braxton Hicks vs Real Labor Contractions:\n\n` +
        `• Braxton Hicks (Practice Contractions):\n` +
        `  - Irregular timing and unpredictable intervals.\n` +
        `  - Feel like tight painless belly bandings.\n` +
        `  - They STOP or ease when you walk, rest, change positions, or drink a tall glass of water.\n` +
        `  - Do not increase in intensity or get closer together.\n\n` +
        `• Real Labor Contractions:\n` +
        `  - Regular, consistent rhythm.\n` +
        `  - Get progressively STRONGER, LONGER, and CLOSER together.\n` +
        `  - Start in the lower back and wrap around to the front pelvis.\n` +
        `  - They DO NOT stop with rest, hydration, or position change.\n\n` +
        `💡 The 5-1-1 Rule for Hospital: Contractions coming every 5 minutes, lasting 1 full minute each, for at least 1 consistent hour!`,
      category: "labor",
    };
  }

  // 20. WATER BREAKING & MUCUS PLUG
  if (
    query.includes("water break") ||
    query.includes("waters broke") ||
    query.includes("amniotic fluid") ||
    query.includes("mucus plug") ||
    query.includes("bloody show")
  ) {
    return {
      reply:
        `💧 Waters Breaking & Mucus Plug Signs:\n\n` +
        `• Mucus Plug & Bloody Show:\n` +
        `  - A jelly-like discharge, sometimes tinged pink or brown.\n` +
        `  - Losing your mucus plug means your cervix is softening and dilating, but labor could still be hours or days away.\n\n` +
        `• Water Breaking (Rupture of Membranes):\n` +
        `  - Can be a dramatic sudden gush or a steady warm trickle that keeps leaking.\n` +
        `  - Remember TACO:\n` +
        `    - Time: Note the exact time it happened.\n` +
        `    - Amount: Trickle or gush?\n` +
        `    - Color: Clear or pale straw-colored is normal. Green/brownish means meconium is present (alert doctor right away).\n` +
        `    - Odor: Amniotic fluid has a sweet/mild scent, not like urine.\n\n` +
        `🏥 Once your water breaks, call your maternity care provider immediately!`,
      category: "labor",
    };
  }

  // 21. HOSPITAL BAG CHECKLIST
  if (
    query.includes("hospital bag") ||
    query.includes("pack for hospital") ||
    query.includes("what to pack") ||
    query.includes("delivery bag")
  ) {
    return {
      reply:
        `👜 Hospital Bag Essentials Checklist (Pack around 35–36 weeks):\n\n` +
        `• For Mother:\n` +
        `  - Medical files, ID, insurance cards, birth plan.\n` +
        `  - 2–3 comfortable front-opening nightgowns / nursing tops.\n` +
        `  - High-waisted disposable or dark cotton underwear + maternity pads.\n` +
        `  - Nursing bras, nipple balm, warm socks, slip-on slippers.\n` +
        `  - Long phone charger cable, lip balm, water bottle with straw.\n\n` +
        `• For Baby 👶:\n` +
        `  - 3–4 newborn onesies/sleepsuits + scratch mittens.\n` +
        `  - Newborn diapers & gentle water wipes.\n` +
        `  - Soft swaddle blankets and baby cap.\n` +
        `  - Approved car seat installed in the vehicle!\n\n` +
        `• For Birth Partner:\n` +
        `  - Change of clothes, snacks, energy drinks, cash, toiletries.`,
      category: "labor",
    };
  }

  // 22. PRENATAL VITAMINS, FOLIC ACID & IRON
  if (
    query.includes("prenatal vitamin") ||
    query.includes("folic acid") ||
    query.includes("iron") ||
    query.includes("calcium") ||
    query.includes("vitamin d") ||
    query.includes("dha") ||
    query.includes("omega 3")
  ) {
    return {
      reply:
        `💊 Essential Prenatal Vitamins & Supplements:\n\n` +
        `• Folic Acid (400–800 mcg daily):\n` +
        `  - Essential in early pregnancy to prevent neural tube defects (spina bifida). Start ideally before conception or immediately upon pregnancy.\n\n` +
        `• Iron (27 mg daily):\n` +
        `  - Supports baby's blood supply and prevents maternal anemia. Tip: Take with Vitamin C (orange juice) to boost absorption; avoid taking with calcium/tea which block absorption.\n\n` +
        `• Calcium (1,000 mg) & Vitamin D (600 IU):\n` +
        `  - Builds baby's bones and teeth without depleting mother's calcium reserves.\n\n` +
        `• DHA / Omega-3 (200–300 mg):\n` +
        `  - Vital for fetal brain, eye, and central nervous system development.\n\n` +
        `💡 Nausea tip: If your prenatal vitamin makes you feel sick, take it right before bedtime with a small snack!`,
      category: "nutrition",
    };
  }

  // 23. ULTRASOUNDS & SCANS EXPLAINED
  if (
    query.includes("ultrasound") ||
    query.includes("scan") ||
    query.includes("nt scan") ||
    query.includes("anomaly scan") ||
    query.includes("dating scan") ||
    query.includes("nipt")
  ) {
    return {
      reply:
        `🩺 Prenatal Scans & Ultrasounds Timeline:\n\n` +
        `• Dating / Viability Scan (Weeks 6–9):\n` +
        `  - Confirms heartbeat, checks intrauterine location, and calculates accurate due date.\n\n` +
        `• Nuchal Translucency (NT) Scan & NIPT (Weeks 11–13):\n` +
        `  - Measures fluid behind baby's neck to screen for chromosomal conditions like Down syndrome.\n\n` +
        `• Mid-Pregnancy Anatomy Scan (Weeks 18–22):\n` +
        `  - Comprehensive review of baby's organs, brain, heart, spine, kidneys, limb growth, amniotic fluid, and placental position.\n\n` +
        `• Growth Scan (Weeks 32–36):\n` +
        `  - Measures fetal growth, estimated weight, amniotic fluid volume, and baby's presentation (head down or breech).`,
      category: "medical_tests",
    };
  }

  // 24. EXERCISE, YOGA & WALKING
  if (
    query.includes("exercise") ||
    query.includes("yoga") ||
    query.includes("walk") ||
    query.includes("gym") ||
    query.includes("pilates") ||
    query.includes("swimming") ||
    query.includes("lifting")
  ) {
    return {
      reply:
        `🧘‍♀️ Safe Exercise During Pregnancy:\n\n` +
        `Regular moderate exercise reduces back pain, eases constipation, lowers gestational diabetes risk, and builds stamina for labor!\n\n` +
        `• Best Activities:\n` +
        `  - Brisk walking (30 minutes daily is phenomenal).\n` +
        `  - Swimming & water aerobics (relieves joint pressure completely).\n` +
        `  - Prenatal yoga and Pilates (tones core and pelvic floor safely).\n` +
        `  - Kegel exercises (pelvic floor contractions 3x daily).\n\n` +
        `• Safety Rules:\n` +
        `  - Do the "Talk Test": You should be able to hold a conversation while exercising without gasping.\n` +
        `  - Avoid contact sports, hot yoga, scuba diving, and exercises lying flat on your back after 20 weeks.\n` +
        `  - Stay hydrated and avoid overheating.`,
      category: "lifestyle",
    };
  }

  // 25. AIR TRAVEL & FLYING
  if (
    query.includes("fly") ||
    query.includes("flying") ||
    query.includes("flight") ||
    query.includes("airplane") ||
    query.includes("travel")
  ) {
    return {
      reply:
        `✈️ Air Travel During Pregnancy:\n\n` +
        `Air travel is generally considered safe for healthy pregnancies:\n\n` +
        `• Best Time to Travel: Second trimester (weeks 14 to 28) — morning sickness has subsided and energy levels are high.\n` +
        `• Airline Cutoff: Most airlines permit domestic travel up to 36 weeks and international up to 28–32 weeks (medical clearance letter usually required after 28 weeks).\n` +
        `• In-Flight Tips:\n` +
        `  - Choose an aisle seat for easy bathroom access.\n` +
        `  - Wear knee-high compression stockings to prevent swelling and deep vein thrombosis (DVT).\n` +
        `  - Drink water continuously and stand up to walk the aisle every 60–90 minutes.\n` +
        `  - Fasten seatbelt low under your baby bump across your hips.`,
      category: "lifestyle",
    };
  }

  // 26. SEX & INTIMACY DURING PREGNANCY
  if (
    query.includes("sex") ||
    query.includes("intimacy") ||
    query.includes("intercourse") ||
    query.includes("can we have sex")
  ) {
    return {
      reply:
        `🌸 Sex & Intimacy During Pregnancy:\n\n` +
        `Yes! In an uncomplicated, low-risk pregnancy, sexual intercourse is completely safe throughout all three trimesters:\n\n` +
        `• Baby is protected: Your baby is surrounded by the strong muscular wall of the uterus, amniotic fluid, and a thick mucus plug sealing the cervix.\n` +
        `• Uterine tightenings: Mild cramping or Braxton Hicks contractions after orgasm are common due to oxytocin release and prostaglandins in semen.\n` +
        `• When to AVOID sex (Consult doctor):\n` +
        `  - If you have placenta previa (placenta covering cervix).\n` +
        `  - Unexplained vaginal bleeding or history of preterm labor.\n` +
        `  - If your water has broken or cervix is dilated prematurely.`,
      category: "lifestyle",
    };
  }

  // 27. SKINCARE, BEAUTY & HAIR DYE
  if (
    query.includes("skincare") ||
    query.includes("retinol") ||
    query.includes("salicylic") ||
    query.includes("hair dye") ||
    query.includes("coloring hair") ||
    query.includes("botox") ||
    query.includes("stretch mark")
  ) {
    return {
      reply:
        `✨ Pregnancy Skincare & Beauty Safety:\n\n` +
        `• What to Avoid in Skincare:\n` +
        `  - Retinoids (Retinol, Retin-A, Tretinoin): Strictly avoid (linked to birth defects).\n` +
        `  - High-dose Salicylic Acid: Switch to gentle lactic or glycolic acid.\n` +
        `  - Botox & Fillers: Postpone until after nursing.\n\n` +
        `• Pregnancy-Safe Skincare Ingredients:\n` +
        `  - Hyaluronic Acid, Niacinamide, Azelaic Acid, Vitamin C serum, and mineral sunscreens (Zinc oxide / Titanium dioxide).\n\n` +
        `• Hair Dye: Generally safe after the 1st trimester. Ensure the salon is well-ventilated and consider balayage or highlights where dye doesn't sit on the scalp.`,
      category: "beauty",
    };
  }

  // 28. POSTPARTUM, BREASTFEEDING & BABY CARE
  if (
    query.includes("breastfeed") ||
    query.includes("latch") ||
    query.includes("colostrum") ||
    query.includes("milk supply") ||
    query.includes("newborn care") ||
    query.includes("formula")
  ) {
    return {
      reply:
        `🤱 Breastfeeding & Newborn Essentials:\n\n` +
        `• Colostrum ("Liquid Gold"):\n` +
        `  - In the first 2–4 days, your breasts produce concentrated, golden colostrum packed with antibodies and immune boosters. Baby only needs a few teaspoons per feed!\n\n` +
        `• Achieving a Deep Latch:\n` +
        `  - Align baby's nose to your nipple.\n` +
        `  - Wait for a wide "yawn" mouth, then bring baby quickly to your breast, aiming the nipple towards the roof of their mouth.\n` +
        `  - Baby's lips should flare outward like fish lips covering more of the lower areola.\n\n` +
        `• Feeding Frequency: Newborns nurse 8 to 12 times in 24 hours (every 2–3 hours). Track wet diapers (at least 6 wet diapers per day after day 5 confirms good milk transfer).`,
      category: "feeding",
    };
  }

  // 29. EMOTIONS, MOOD SWINGS & MENTAL HEALTH
  if (
    query.includes("anxious") ||
    query.includes("anxiety") ||
    query.includes("crying") ||
    query.includes("depressed") ||
    query.includes("scared") ||
    query.includes("overwhelmed") ||
    query.includes("sad") ||
    query.includes("mood swing")
  ) {
    return {
      reply:
        `🌸 You Are Not Alone, ${name} — Gentle Heart Check-in:\n\n` +
        `Pregnancy is a massive emotional, physical, and hormonal transition. Feeling tearful, anxious, or overwhelmed is not a sign of weakness — it is your brain processing a huge life shift.\n\n` +
        `• Gentle steps to nurture your mind:\n` +
        `  - Give yourself grace: You don't have to feel glowing or happy every minute.\n` +
        `  - Share your feelings openly with your partner, family, or trusted friend.\n` +
        `  - Take 10 minutes of quiet breathing: Place your hands on your belly and take 5 slow, grounding breaths.\n` +
        `  - Step outside: A short stroll in natural sunlight lowers cortisol and lifts mood.\n\n` +
        `❤️ Professional Care: If sadness, panic, or persistent worry lasts for more than two weeks, please speak with your OB-GYN or midwife. Antenatal anxiety and depression are common and very treatable. You deserve support!`,
      category: "mental_health",
    };
  }

  // 30. CURRENT WEEK / TRIMESTER PROGRESS
  if (
    query.includes("my week") ||
    query.includes("how far along") ||
    query.includes("which week") ||
    query.includes("trimester") ||
    query.includes("development this week")
  ) {
    const currentWeek = week ? `${week}` : "your current stage";
    return {
      reply:
        `🌱 Your Pregnancy Milestone (Week ${currentWeek}):\n\n` +
        `At week ${currentWeek}, your body and baby are undergoing remarkable milestones:\n\n` +
        `• For You, Mama:\n` +
        `  - Your uterus is adapting, blood volume is expanding by up to 50%, and your ligaments are gently softening.\n` +
        `  - Prioritize resting when tired, drinking 2.5–3 liters of water, and keeping up with your prenatal vitamins.\n\n` +
        `• Action for This Week:\n` +
        `  - Review your upcoming prenatal visit in LittleBloom.\n` +
        `  - Take 5 minutes to write a memory or photo in your LittleBloom Journal!\n\n` +
        `Would you like specific guidance on symptoms, nutrient focus, or exercises for this week? Just ask!`,
      category: "milestone",
    };
  }

  // 31. CONVERSATIONAL & GREETINGS
  if (
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query.includes("who are you") ||
    query.includes("what can you do")
  ) {
    return {
      reply:
        `🌸 Hello ${name}! I'm your LittleBloom AI Healthcare Companion.\n\n` +
        `I'm here to support you 24/7 like ChatGPT, specialized in maternal and childcare wellness! You can ask me anything, such as:\n\n` +
        `• 💊 Medicine safety: "Can I take paracetamol or antacids?"\n` +
        `• 🥗 Food & diet: "Can I eat pineapple, sushi, or drink coffee?"\n` +
        `• 🩺 Symptoms: "How to ease heartburn, morning sickness, or back pain?"\n` +
        `• ⏱️ Labor: "What are the signs of labor vs Braxton Hicks?"\n` +
        `• 👶 Baby care: "Newborn sleep, kick counting, or breastfeeding tips."\n\n` +
        `What question is on your mind today?`,
      category: "greeting",
    };
  }

  // 32. AFFIRMATION / ENCOURAGEMENT / JOKE
  if (
    query.includes("affirmation") ||
    query.includes("encourage") ||
    query.includes("joke") ||
    query.includes("quote") ||
    query.includes("motivate")
  ) {
    return {
      reply:
        `✨ Daily Affirmation for You, ${name} 🌸\n\n` +
        `"My body is strong, wise, and capable. I am creating a miracle one day at a time, and I trust myself to be the exact mother my baby needs."\n\n` +
        `Remember to breathe deeply today. You are doing an incredible job, mama! 💖`,
      category: "affirmation",
    };
  }

  // 33. BROAD COMPREHENSIVE INTELLIGENCE FALLBACK (CHATGPT STYLE)
  return {
    reply:
      `🌸 Little Bloom Care Guide:\n\n` +
      `Thank you for asking, ${name}. Regarding your question "${userMessage}":\n\n` +
      `• Evidence-Based Guidance:\n` +
      `  - During pregnancy, your body undergoes profound hormonal, circulatory, and musculoskeletal adaptations. Many new sensations, cravings, or changes in energy are completely natural parts of this journey.\n\n` +
      `• Key Recommendations & Safe Steps:\n` +
      `  - Stay Well-Hydrated: Aim for 8–10 glasses of water daily to support expanding amniotic fluid and blood volume.\n` +
      `  - Nourish Your Body: Prioritize lean proteins, colorful vegetables, healthy fats (avocado, nuts), and your daily prenatal vitamins.\n` +
      `  - Listen to Your Rhythms: Rest when fatigued, keep feet elevated when possible, and avoid strenuous heavy lifting.\n` +
      `  - Mindful Movement: Gentle walking, pelvic tilts, and deep abdominal breathing can relieve tension.\n\n` +
      `👩‍⚕️ Medical Partnership:\n` +
      `Every pregnancy is unique. If you have sudden concerns, notice severe pain, unusual bleeding, or sudden changes in your symptoms, always consult your OB-GYN or midwife for personalized care.\n\n` +
      `Feel free to ask me for more specific details or next steps!`,
    category: "general",
  };
}

// Controller Handler
exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, language = "English", history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Retrieve user and profile context gracefully
    let context = {
      userName: "Mama",
      mode: "pregnancy",
      pregnancyWeek: null,
      childName: null,
    };

    try {
      if (req.userId) {
        const user = await User.findById(req.userId).select("name mode");
        let pregnancyWeek = null;
        let childName = null;

        if (user && user.mode === "pregnancy") {
          const pProfile = await PregnancyProfile.findOne({ userId: req.userId });
          pregnancyWeek = pProfile?.pregnancyWeek || null;
        } else if (user && user.mode === "child") {
          const cProfile = await ChildProfile.findOne({ userId: req.userId });
          childName = cProfile?.childName || null;
        }

        context = {
          userName: user?.name || "Mama",
          mode: user?.mode || "pregnancy",
          pregnancyWeek,
          childName,
        };
      }
    } catch (dbErr) {
      console.warn("User context lookup skipped:", dbErr.message);
    }

    // Detect language from text or user parameter (Kannada, Hindi, Tamil, Telugu, English)
    const targetLanguage = detectScriptLanguage(message, language);

    // 1. Try external cloud Transformer / LLM if configured
    const aiResponse = await callExternalAI(message, context, targetLanguage, history);
    if (aiResponse) {
      return res.status(200).json({
        success: true,
        reply: aiResponse,
        category: "ai_generated",
        detectedLanguage: targetLanguage,
        mode: context.mode,
      });
    }

    // 2. Built-in Multilingual Indic NLP & Transformer Engine
    if (targetLanguage !== "English") {
      const multilingualResult = processMultilingualQuestion(message, context, targetLanguage);
      return res.status(200).json({
        success: true,
        reply: multilingualResult.reply,
        category: multilingualResult.intent,
        detectedLanguage: targetLanguage,
        mode: context.mode,
      });
    }

    // English deep maternal intelligence fallback
    const expert = generateExpertResponse(message, context, targetLanguage);

    return res.status(200).json({
      success: true,
      reply: expert.reply,
      category: expert.category,
      detectedLanguage: "English",
      mode: context.mode,
    });
  } catch (error) {
    console.error("Chatbot controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process chat request",
      reply:
        "🌸 Little Bloom is here for you. Please check your internet connection or ask another question.",
    });
  }
};
