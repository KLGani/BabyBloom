import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { goBackOrReplace } from "../utils/navigation";
import * as SecureStore from "../utils/storage";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Milestone = { id: string; title: string; detail: string; icon: string; done: boolean };
const KEY = "childMilestones";

const MILESTONES_BY_LANG: Record<SupportedLanguage, { id: string; title: string; detail: string; icon: string }[]> = {
  English: [
    { id: "social", title: "A moment of connection", detail: "Smiled, responded, or enjoyed time with someone familiar", icon: "💛" },
    { id: "movement", title: "On the move", detail: "Reached, rolled, crawled, walked, or tried a new movement", icon: "🧸" },
    { id: "sounds", title: "Finding their voice", detail: "Made a new sound, gesture, or tried a word", icon: "🎵" },
    { id: "explore", title: "Curious explorer", detail: "Investigated a toy, book, texture, or new place", icon: "🌈" },
    { id: "independent", title: "A little more independent", detail: "Tried a new skill during play or a daily routine", icon: "⭐" },
  ],
  Kannada: [
    { id: "social", title: "ಸ್ನೇಹಪರ ನಗು ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ", detail: "ಪರಿಚಿತರನ್ನು ಕಂಡು ಮುಗುಳುನಗೆ ಚೆಲ್ಲಿದ ಕ್ಷಣ ಅಥವಾ ಸಮಯ ಕಳೆದದ್ದು", icon: "💛" },
    { id: "movement", title: "ಚಲನೆಯಲ್ಲಿ ಮುನ್ನಡೆ", detail: "ಉರುಳಾಡುವುದು, ತೆವಳುವುದು, ಹೆಜ್ಜೆ ಹಾಕುವುದು ಅಥವಾ ಹೊಸ ಚಲನೆ", icon: "🧸" },
    { id: "sounds", title: "ಸ್ವರದ ಕಲರವ", detail: "ಹೊಸ ಸದ್ದು ಮಾಡುವುದು, ಸನ್ನೆ ಮಾಡುವುದು ಅಥವಾ ಮಾತು ಕಲಿಯುವುದು", icon: "🎵" },
    { id: "explore", title: "ಕುತೂಹಲದ ಅನ್ವೇಷಣೆ", detail: "ಆಟಿಕೆ, ಪುಸ್ತಕ ಅಥವಾ ಹೊಸ ಸ್ಥಳವನ್ನು ಕುತೂಹಲದಿಂದ ಗಮನಿಸುವುದು", icon: "🌈" },
    { id: "independent", title: "ಸ್ವಾವಲಂಬನೆಯ ಮೊದಲ ಹೆಜ್ಜೆ", detail: "ದೈನಂದಿನ ಆಟದಲ್ಲಿ ಅಥವಾ ದಿನಚರಿಯಲ್ಲಿ ಹೊಸ ಕೌಶಲ್ಯ ಪ್ರದರ್ಶಿಸುವುದು", icon: "⭐" },
  ],
  Hindi: [
    { id: "social", title: "मुस्कान और जुड़ाव का पल", detail: "किसी परिचित को देखकर मुस्कुराना या बात करने की कोशिश", icon: "💛" },
    { id: "movement", title: "गतिविधि और हलचल", detail: "पलटना, घुटनों के बल चलना, खड़े होना या चलना", icon: "🧸" },
    { id: "sounds", title: "अपनी आवाज़ पहचानना", detail: "नई आवाज़ें निकालना, इशारे करना या शब्द बोलना", icon: "🎵" },
    { id: "explore", title: "जिज्ञासु नन्हा खोजी", detail: "खिलौनों, किताबों या नई जगहों को उत्सुकता से देखना", icon: "🌈" },
    { id: "independent", title: "स्वावलंबन की ओर कदम", detail: "खेलते समय या दिनचर्या में नया हुनर आजमाना", icon: "⭐" },
  ],
  Tamil: [
    { id: "social", title: "புன்னகை மற்றும் பாசப் பிணைப்பு", detail: "அன்பானவர்களைப் பார்த்து சிரிப்பது அல்லது பேசுவது", icon: "💛" },
    { id: "movement", title: "சுறுசுறுப்பான இயக்கம்", detail: "புரள்வது, தவழ்வது, நடப்பது அல்லது புதிய அசைவு", icon: "🧸" },
    { id: "sounds", title: "மழலைப் பேச்சு", detail: "புதிய சப்தங்கள் எழுப்புவது அல்லது பேச முயற்சிப்பது", icon: "🎵" },
    { id: "explore", title: "ஆர்வமிக்க தேடல்", detail: "பொம்மைகள் அல்லது புதிய இடங்களை உற்று நோக்குவது", icon: "🌈" },
    { id: "independent", title: "சுயமுயற்சி", detail: "விளையாட்டின் போது புதிய திறமைகளை வெளிப்படுத்துவது", icon: "⭐" },
  ],
  Telugu: [
    { id: "social", title: "చిరునవ్వు & అనుబంధం", detail: "పరిచితులను చూసి నవ్వడం లేదా స్పందించడం", icon: "💛" },
    { id: "movement", title: "కదలికలలో ఎదుగుదల", detail: "దొర్లడం, పాకడం, నడవడం లేదా కొత్త కదలికలు", icon: "🧸" },
    { id: "sounds", title: "చిన్ని పలుకులు", detail: "కొత్త శబ్దాలు చేయడం, సైగలు లేదా మాటలు పలకడం", icon: "🎵" },
    { id: "explore", title: "ఆసక్తికర అన్వేషణ", detail: "బొమ్మలు, పుస్తకాలు లేదా కొత్త వస్తువులను పరిశీలించడం", icon: "🌈" },
    { id: "independent", title: "స్వతంత్ర అడుగులు", detail: "ఆటలలో కొత్త నైపుణ్యాలను ప్రయత్నించడం", icon: "⭐" },
  ],
};

const EXTRA_UI: Record<SupportedLanguage, {
  eyebrow: string;
  allDone: string;
  notDone: string;
  ofWord: string;
  heroFoot: string;
  toExplore: string;
  momentLabel: string;
  footerTitle: string;
  footerText: string;
}> = {
  English: {
    eyebrow: "LITTLE BLOOM · GROWING EVERY DAY",
    allDone: "Every moment celebrated!",
    notDone: "Look at them bloom",
    ofWord: "of",
    heroFoot: "Tap a card when you want to add that moment to your keepsakes.",
    toExplore: "to explore",
    momentLabel: "MOMENT",
    footerTitle: "Every child has their own rhythm",
    footerText: "These are memory prompts, not a developmental assessment. If something concerns you, talk with your child’s healthcare professional.",
  },
  Kannada: {
    eyebrow: "ಲಿಟಲ್ ಬ್ಲೂಮ್ · ಪ್ರತಿದಿನವೂ ಹೊಸ ಬೆಳವಣಿಗೆ",
    allDone: "ಎಲ್ಲಾ ಸುಂದರ ಕ್ಷಣಗಳು ದಾಖಲಾಗಿವೆ!",
    notDone: "ಮಗುವಿನ ಬೆಳವಣಿಗೆಯ ನೋಟ",
    ofWord: "ರಲ್ಲಿ",
    heroFoot: "ಆ ಕ್ಷಣವನ್ನು ನಿಮ್ಮ ನೆನಪಿನ ಪುಟಕ್ಕೆ ಸೇರಿಸಲು ಕಾರ್ಡ್ ಸ್ಪರ್ಶಿಸಿ.",
    toExplore: "ಉಳಿದಿವೆ",
    momentLabel: "ಕ್ಷಣ",
    footerTitle: "ಪ್ರತಿಯೊಂದು ಮಗುವಿಗೂ ತನ್ನದೇ ಆದ ವೇಗವಿರುತ್ತದೆ",
    footerText: "ಇವು ನೆನಪಿನ ಪ್ರೇರಣೆಗಳು ಮಾತ್ರ, ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಯಲ್ಲ. ಯಾವುದೇ ಸಂದೇಹವಿದ್ದರೆ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  },
  Hindi: {
    eyebrow: "लिटिल ब्लूम · हर दिन नया विकास",
    allDone: "सभी खूबसूरत पल संजोए गए!",
    notDone: "बच्चे के विकास की झलक",
    ofWord: "में से",
    heroFoot: "उस पल को यादों में जोड़ने के लिए कार्ड पर टैप करें।",
    toExplore: "शेष हैं",
    momentLabel: "क्षण",
    footerTitle: "हर बच्चे की अपनी गति होती है",
    footerText: "ये केवल यादों के संकेत हैं, कोई चिकित्सीय मूल्यांकन नहीं। किसी भी चिंता के लिए डॉक्टर से बात करें।",
  },
  Tamil: {
    eyebrow: "லிட்டில் ப்ளூம் · ஒவ்வொரு நாளும் வளர்ச்சி",
    allDone: "அனைத்து நினைவுகளும் பதிவு செய்யப்பட்டன!",
    notDone: "வளர்ச்சியின் அழகான தருணங்கள்",
    ofWord: "இல்",
    heroFoot: "நினைவில் சேர்க்க கார்டைத் தொடவும்.",
    toExplore: "மீதமுள்ளன",
    momentLabel: "தருணம்",
    footerTitle: "ஒவ்வொரு குழந்தைக்கும் தனித்தனி வேகம் உண்டு",
    footerText: "இவை நினைவூட்டல்கள் மட்டுமே. ஏதேனும் கவலை இருந்தால் மருத்துவரை அணுகவும்.",
  },
  Telugu: {
    eyebrow: "లిటిల్ బ్లూమ్ · ప్రతిరోజూ ఎదుగుదల",
    allDone: "అన్ని మధుర క్షణాలు నమోదయ్యాయి!",
    notDone: "ఎదుగుదల సంబరం",
    ofWord: "లో",
    heroFoot: "ఆ క్షణాన్ని గుర్తుంచుకోవడానికి కార్డును తాకండి.",
    toExplore: "మిగిలి ఉన్నాయి",
    momentLabel: "క్షణము",
    footerTitle: "ప్రతి బిడ్డకు వారి స్వంత వేగం ఉంటుంది",
    footerText: "ఇవి జ్ఞాపకాల కోసం మాత్రమే. ఏదైనా సందేహం ఉంటే మీ వైద్యుడిని సంప్రదించండి.",
  },
};

export default function ChildMilestones() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((value) => {
      if (!value) return;
      try {
        const saved: { id: string; done: boolean }[] = JSON.parse(value);
        const map: Record<string, boolean> = {};
        saved.forEach((item) => {
          map[item.id] = !!item.done;
        });
        setCompletedIds(map);
      } catch {}
    });
  }, []);

  const toggle = (id: string) => {
    const next = { ...completedIds, [id]: !completedIds[id] };
    setCompletedIds(next);
    const saveArray = Object.keys(next).map((k) => ({ id: k, done: next[k] }));
    void SecureStore.setItemAsync(KEY, JSON.stringify(saveArray));
  };

  const rawMilestones = MILESTONES_BY_LANG[language] || MILESTONES_BY_LANG.English;
  const items: Milestone[] = rawMilestones.map((m) => ({
    ...m,
    done: !!completedIds[m.id],
  }));

  const done = items.filter((item) => item.done).length;
  const progress = items.length ? done / items.length : 0;
  const ui = EXTRA_UI[language] || EXTRA_UI.English;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header bar */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => goBackOrReplace()} style={styles.back}>
            <Text style={styles.backText}>‹  {t.back}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>{ui.eyebrow}</Text>
        <Text style={styles.title}>{t.milestonesTitle}</Text>
        <Text style={styles.subtitle}>{t.milestonesSubtitle}</Text>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>✨</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                {done === items.length ? ui.allDone : ui.notDone}
              </Text>
              <Text style={styles.heroSub}>
                {done} {ui.ofWord} {items.length} {t.momentsCelebrated}
              </Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.heroFoot}>{ui.heroFoot}</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>{t.everydayDiscoveries}</Text>
          <Text style={styles.count}>
            {items.length - done} {ui.toExplore}
          </Text>
        </View>

        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.82}
            onPress={() => toggle(item.id)}
            style={[styles.card, item.done && styles.cardDone]}
          >
            <View style={[styles.cardIcon, item.done && styles.cardIconDone]}>
              <Text style={styles.cardEmoji}>{item.done ? "🌟" : item.icon}</Text>
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardKicker}>
                {ui.momentLabel} {String(index + 1).padStart(2, "0")}
              </Text>
              <Text style={[styles.cardTitle, item.done && styles.cardTitleDone]}>
                {item.title}
              </Text>
              <Text style={styles.cardDetail}>{item.detail}</Text>
            </View>
            <View style={[styles.check, item.done && styles.checked]}>
              {item.done ? <Text style={styles.checkText}>✓</Text> : <Text style={styles.plus}>＋</Text>}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.footerCard}>
          <Text style={styles.footerIcon}>🌱</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerTitle}>{ui.footerTitle}</Text>
            <Text style={styles.footerText}>{ui.footerText}</Text>
          </View>
        </View>
      </ScrollView>

      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F4FAF7" },
  content: { padding: 20, paddingTop: 20, paddingBottom: 42 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: { paddingVertical: 6 },
  backText: { color: "#4F8279", fontWeight: "700", fontSize: 15 },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#E2F2EC",
    borderWidth: 1,
    borderColor: "#A8D8C7",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E695D",
  },
  eyebrow: { color: "#73A69B", letterSpacing: 1.4, fontSize: 9, fontWeight: "900" },
  title: { fontSize: 28, fontWeight: "900", color: "#294F4A", marginTop: 7 },
  subtitle: { color: "#69857F", lineHeight: 20, marginTop: 7, marginBottom: 20 },
  hero: { backgroundColor: "#DDF1EA", padding: 18, borderRadius: 24, marginBottom: 25 },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroIcon: {
    height: 52,
    width: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 27 },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroTitle: { color: "#315D57", fontSize: 17, fontWeight: "900" },
  heroSub: { color: "#63877F", fontSize: 12, marginTop: 4 },
  track: { height: 9, backgroundColor: "#C7E3D9", borderRadius: 8, overflow: "hidden", marginTop: 18 },
  fill: { height: 9, backgroundColor: "#67AA98", borderRadius: 8 },
  heroFoot: { color: "#66877F", fontSize: 11, lineHeight: 16, marginTop: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  section: { color: "#294F4A", fontSize: 18, fontWeight: "900" },
  count: { color: "#7D9B94", fontSize: 11, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#315D57",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardDone: { backgroundColor: "#F0F8F4" },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF4D8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconDone: { backgroundColor: "#DDF1E7" },
  cardEmoji: { fontSize: 23 },
  cardCopy: { flex: 1, marginHorizontal: 12 },
  cardKicker: { fontSize: 8, letterSpacing: 1, fontWeight: "900", color: "#8AA49D" },
  cardTitle: { fontSize: 14, color: "#315D57", fontWeight: "900", marginTop: 3 },
  cardTitleDone: { color: "#528477" },
  cardDetail: { fontSize: 11, lineHeight: 16, color: "#7B918B", marginTop: 4 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#BDD4CC",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: "#67AA98", borderColor: "#67AA98" },
  checkText: { color: "white", fontSize: 16, fontWeight: "900" },
  plus: { color: "#79A297", fontSize: 19 },
  footerCard: {
    marginTop: 12,
    backgroundColor: "#FFF4DF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  footerIcon: { fontSize: 22, marginRight: 11 },
  footerTitle: { color: "#745B34", fontSize: 13, fontWeight: "900" },
  footerText: { color: "#806E50", fontSize: 11, lineHeight: 16, marginTop: 4 },
});
