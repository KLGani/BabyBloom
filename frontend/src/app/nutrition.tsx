import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { goBackOrReplace } from "../utils/navigation";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Nutrient = {
  name: string;
  icon: string;
  benefit: string;
  foods: string;
};

type TrimesterInfo = {
  title: string;
  weeks: string;
  icon: string;
  focus: string;
  foods: string;
  tip: string;
};

const NUTRIENTS_BY_LANG: Record<SupportedLanguage, Nutrient[]> = {
  English: [
    {
      name: "Iron",
      icon: "🩸",
      benefit: "Helps prevent anemia and supports healthy blood production.",
      foods: "Spinach, beans, lentils, dates, jaggery",
    },
    {
      name: "Calcium",
      icon: "🥛",
      benefit: "Supports strong bones and teeth for both mother and baby.",
      foods: "Milk, curd, paneer, ragi, sesame",
    },
    {
      name: "Folate / Folic Acid",
      icon: "🌿",
      benefit: "Supports early neural tube and healthy baby development.",
      foods: "Green vegetables, lentils, beans, citrus fruits",
    },
    {
      name: "Protein",
      icon: "🥚",
      benefit: "Helps build and repair maternal and fetal tissues.",
      foods: "Eggs, pulses, nuts, paneer, sprouts",
    },
    {
      name: "Vitamin C",
      icon: "🍊",
      benefit: "Supports maternal immunity and enhances iron absorption.",
      foods: "Oranges, amla, guava, tomatoes",
    },
    {
      name: "Omega-3 DHA",
      icon: "🐟",
      benefit: "Supports the rapid development of the baby's brain and eyes.",
      foods: "Walnuts, chia seeds, flax seeds",
    },
  ],
  Kannada: [
    {
      name: "ಕಬ್ಬಿಣದ ಅಂಶ (ಐರನ್)",
      icon: "🩸",
      benefit: "ರಕ್ತಹೀನತೆ ತಡೆಯುತ್ತದೆ ಮತ್ತು ತಾಯಿ-ಮಗುವಿನಲ್ಲಿ ರಕ್ತ ಉತ್ಪಾದನೆ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      foods: "ಪಾಲಕ್ ಸೊಪ್ಪು, ಬೇಳೆಕಾಳು, ಖರ್ಜೂರ, ಬೆಲ್ಲ, ಬೀಟ್‌ರೂಟ್",
    },
    {
      name: "ಕ್ಯಾಲ್ಸಿಯಂ",
      icon: "🥛",
      benefit: "ಮಗುವಿನ ಎಲುಬುಗಳು, ಹಲ್ಲುಗಳ ಬಲವರ್ಧನೆಗೆ ಮತ್ತು ತಾಯಿಯ ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯಗತ್ಯ.",
      foods: "ಹಾಲು, ಮೊಸರು, ರಾಗಿ, ಪನೀರ್, ಎಳ್ಳು",
    },
    {
      name: "ಫೋಲೇಟ್ / ಫೋಲಿಕ್ ಆಮ್ಲ",
      icon: "🌿",
      benefit: "ಮಗುವಿನ ಮಿದುಳು ಮತ್ತು ನರಮಂಡಲದ ಆರೋಗ್ಯಕರ ಬೆಳವಣಿಗೆಗೆ ಸಹಕಾರಿ.",
      foods: "ಹಸಿರು ಸೊಪ್ಪು, ಕಿತ್ತಳೆ ಹಣ್ಣು, ಮೊಳಕೆ ಕಾಳುಗಳು",
    },
    {
      name: "ಪ್ರೋಟೀನ್",
      icon: "🥚",
      benefit: "ದೇಹದ ಅಂಗಾಂಶಗಳ ಬೆಳವಣಿಗೆ ಮತ್ತು ಮಗುವಿನ ತೂಕ ಹೆಚ್ಚಳಕ್ಕೆ ನೆರವಾಗುತ್ತದೆ.",
      foods: "ಮೊಟ್ಟೆ, ಬೇಳೆಗಳು, ಕಡಲೆ, ಪನೀರ್, ಬಾದಾಮಿ",
    },
    {
      name: "ವಿಟಮಿನ್ ಸಿ",
      icon: "🍊",
      benefit: "ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹೆಚ್ಚಿಸುತ್ತದೆ ಮತ್ತು ಕಬ್ಬಿಣದ ಅಂಶ ಹೀರಲು ನೆರವಾಗುತ್ತದೆ.",
      foods: "ನೆಲ್ಲಿಕಾಯಿ, ಕಿತ್ತಳೆ, ಸೀಬೆಹಣ್ಣು, ನಿಂಬೆಹಣ್ಣು",
    },
    {
      name: "ಒಮೆಗಾ-3 ಡಿಎಚ್‌ಎ",
      icon: "🐟",
      benefit: "ಮಗುವಿನ ಮಿದುಳು ಮತ್ತು ಕಣ್ಣಿನ ಚುರುಕುತನದ ಬೆಳವಣಿಗೆಗೆ ಪೂರಕ.",
      foods: "ಅಕ್ರೋಟು (ವಾಲ್ನಟ್), ಅಗಸೆ ಬೀಜಗಳು, ಚಿಯಾ ಬೀಜಗಳು",
    },
  ],
  Hindi: [
    {
      name: "आयरन (लोहा)",
      icon: "🩸",
      benefit: "एनीमिया से बचाता है और स्वस्थ रक्त उत्पादन में मदद करता है।",
      foods: "पालक, दालें, खजूर, गुड़, चुकंदर",
    },
    {
      name: "कैल्शियम",
      icon: "🥛",
      benefit: "मां और बच्चे दोनों की हड्डियों और दांतों को मजबूत बनाता है।",
      foods: "दूध, दही, पनीर, रागी, तिल",
    },
    {
      name: "फोलेट / फोलिक एसिड",
      icon: "🌿",
      benefit: "शिशु के मस्तिष्क और रीढ़ के स्वस्थ विकास में महत्वपूर्ण।",
      foods: "हरी पत्तेदार सब्जियां, दालें, संतरे",
    },
    {
      name: "प्रोटीन",
      icon: "🥚",
      benefit: "ऊतकों के निर्माण और बच्चे के समुचित विकास में सहायक।",
      foods: "अंडे, दालें, पनीर, मेवे, अंकुरित अनाज",
    },
    {
      name: "विटामिन सी",
      icon: "🍊",
      benefit: "रोग प्रतिरोधक क्षमता बढ़ाता है और आयरन अवशोषण में मदद करता है।",
      foods: "आंवला, संतरा, अमरूद, नींबू",
    },
    {
      name: "ओमेगा-3 डीएचए",
      icon: "🐟",
      benefit: "शिशु के मस्तिष्क और आंखों के विकास में सहायक।",
      foods: "अखरोट, अलसी के बीज, चिया बीज",
    },
  ],
  Tamil: [
    {
      name: "இரும்புச்சத்து (Iron)",
      icon: "🩸",
      benefit: "இரத்த சோகையைத் தடுத்து ஆரோக்கியமான இரத்த ஓட்டத்தை ஆதரிக்கிறது.",
      foods: "கீரை, பருப்பு, பேரீச்சம்பழம், வெல்லம்",
    },
    {
      name: "கால்சியம்",
      icon: "🥛",
      benefit: "தாய் மற்றும் குழந்தையின் எலும்புகள் மற்றும் பற்களை பலப்படுத்துகிறது.",
      foods: "பால், தயிர், ராகி, பன்னீர், எள்ளு",
    },
    {
      name: "ஃபோலிக் அமிலம்",
      icon: "🌿",
      benefit: "குழந்தையின் மூளை மற்றும் நரம்பு மண்டல வளர்ச்சிக்கு மிக முக்கியம்.",
      foods: "பசலைக்கீரை, பயறு வகைகள், சிட்ரஸ் பழங்கள்",
    },
    {
      name: "புரதம் (Protein)",
      icon: "🥚",
      benefit: "உடல் திசுக்கள் மற்றும் குழந்தையின் சீரான வளர்ச்சிக்கு உதவுகிறது.",
      foods: "முட்டை, பருப்பு வகைகள், சுண்டல், பன்னீர்",
    },
    {
      name: "வைட்டமின் சி",
      icon: "🍊",
      benefit: "நோய் எதிர்ப்பு சக்தியை அதிகரித்து இரும்புச்சத்தை உடல் உறிஞ்ச உதவுகிறது.",
      foods: "நெல்லிக்காய், ஆரஞ்சு, கொய்யா, எலுமிச்சை",
    },
    {
      name: "ஒமேகா-3",
      icon: "🐟",
      benefit: "குழந்தையின் மூளை மற்றும் கண் பார்வை வளர்ச்சிக்கு சிறந்தது.",
      foods: "அக்ரூட், ஆளி விதைகள், சியா விதைகள்",
    },
  ],
  Telugu: [
    {
      name: "ఐరన్ (ఇనుము)",
      icon: "🩸",
      benefit: "రక్తహీనతను నివారిస్తుంది మరియు రక్తకణాల ఉత్పత్తికి తోడ్పడుతుంది.",
      foods: "పాలకూర, పప్పులు, ఖర్జూరం, బెల్లం, బీట్‌రూట్",
    },
    {
      name: "కాల్షియం",
      icon: "🥛",
      benefit: "తల్లి మరియు బిడ్డ ఎముకలు, దంతాల పటిష్టతకు చాలా ముఖ్యం.",
      foods: "పాలు, పెరుగు, రాగులు, పనీర్, నువ్వులు",
    },
    {
      name: "ఫోలేట్ / ఫోలిక్ యాసిడ్",
      icon: "🌿",
      benefit: "శిశువు మెదడు మరియు నరాల వ్యవస్థ ఆరోగ్యకరమైన అభివృద్ధికి తోడ్పడుతుంది.",
      foods: "ఆకుకూరలు, పప్పులు, నారింజ, చిక్కుళ్ళు",
    },
    {
      name: "ప్రొటీన్",
      icon: "🥚",
      benefit: "కణజాలాల నిర్మాణం మరియు శిశువు ఆరోగ్యకర ఎదుగుదలకు అవసరం.",
      foods: "గుడ్లు, పప్పులు, మొలకలు, పనీర్, బాదం",
    },
    {
      name: "విటమిన్ సి",
      icon: "🍊",
      benefit: "రోగనిరోధక శక్తిని పెంచుతుంది మరియు ఐరన్ శోషణకు సహాయపడుతుంది.",
      foods: "ఉసిరి, నారింజ, జామ, నిమ్మ",
    },
    {
      name: "ఒమేగా-3",
      icon: "🐟",
      benefit: "శిశువు మెదడు మరియు కంటిచూపు అభివృద్ధికి కీలకం.",
      foods: "వాల్‌నట్స్, అవిసె గింజలు, చియా గింజలు",
    },
  ],
};

const TRIMESTERS_BY_LANG: Record<SupportedLanguage, TrimesterInfo[]> = {
  English: [
    {
      title: "First Trimester",
      weeks: "Weeks 1–13",
      icon: "🌱",
      focus: "Focus on folate, iron, and staying hydrated. Eat small, frequent meals.",
      foods: "Leafy greens, lentils, eggs, fruits, whole grains",
      tip: "Ginger tea and plain crackers help ease morning nausea.",
    },
    {
      title: "Second Trimester",
      weeks: "Weeks 14–27",
      icon: "🌸",
      focus: "Bone and tissue growth peak; increase calcium, protein and vitamin D.",
      foods: "Dairy, paneer, ragi, vegetables, nuts, pulses",
      tip: "Include calcium-rich snacks and stay active with walking.",
    },
    {
      title: "Third Trimester",
      weeks: "Weeks 28–40+",
      icon: "🌷",
      focus: "Rapid baby growth; nourish with nutrient-dense foods and healthy fats.",
      foods: "Nuts, seeds, dairy, dal, green vegetables, fresh fruits",
      tip: "Eat smaller meals more frequently to prevent acid reflux.",
    },
  ],
  Kannada: [
    {
      title: "ಮೊದಲ ತ್ರೈಮಾಸಿಕ",
      weeks: "1–13 ವಾರಗಳು",
      icon: "🌱",
      focus: "ಫೋಲೇಟ್, ಸಾಕಷ್ಟು ನೀರು ಮತ್ತು ಲಘು ಆಹಾರಕ್ಕೆ ಗಮನ ನೀಡಿ.",
      foods: "ಹಸಿರು ಸೊಪ್ಪು, ಮೊಳಕೆ ಕಾಳು, ಹಣ್ಣುಗಳು, ಮಜ್ಜಿಗೆ",
      tip: "ಶುಂಠಿ ಚಹಾ ಮತ್ತು ಒಣ ಬಿಸ್ಕತ್ತು ವಾಕರಿಕೆ ಕಡಿಮೆ ಮಾಡಲು ಸಹಕಾರಿ.",
    },
    {
      title: "ಎರಡನೇ ತ್ರೈಮಾಸಿಕ",
      weeks: "14–27 ವಾರಗಳು",
      icon: "🌸",
      focus: "ಕ್ಯಾಲ್ಸಿಯಂ, ಪ್ರೋಟೀನ್ ಮತ್ತು ವಿಟಮಿನ್ ಡಿ ಹೆಚ್ಚಿಸಿ.",
      foods: "ಹಾಲು, ಮೊಸರು, ರಾಗಿ, ಪನೀರ್, ಬಾದಾಮಿ, ತರಕಾರಿಗಳು",
      tip: "ರಾಗಿ ಗಂಜಿ ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ಭರಿತ ತಿಂಡಿಗಳನ್ನು ದಿನನಿತ್ಯ ಸೇವಿಸಿ.",
    },
    {
      title: "ಮೂರನೇ ತ್ರೈಮಾಸಿಕ",
      weeks: "28–40+ ವಾರಗಳು",
      icon: "🌷",
      focus: "ಮಗುವಿನ ತೂಕ ಹೆಚ್ಚಳಕ್ಕೆ ಪೌಷ್ಟಿಕ ಆಹಾರ ಮತ್ತು ನಾರಿನಂಶ ಅವಶ್ಯಕ.",
      foods: "ಒಣಹಣ್ಣುಗಳು, ಬೀಜಗಳು, ಕಾಳುಗಳು, ತಾಜಾ ಹಣ್ಣುಗಳು",
      tip: "ಎದೆಯುರಿ ತಪ್ಪಿಸಲು ದಿನವಿಡೀ ಸಣ್ಣ ಪ್ರಮಾಣದ ಊಟವನ್ನು ಹಲವು ಬಾರಿ ಮಾಡಿ.",
    },
  ],
  Hindi: [
    {
      title: "पहली तिमाही",
      weeks: "1–13 सप्ताह",
      icon: "🌱",
      focus: "फोलेट, आयरन और पर्याप्त जलपान पर ध्यान दें।",
      foods: "हरी सब्जियां, दालें, फल, साबुत अनाज",
      tip: "अदरक की चाय और हल्के बिस्कुट उल्टी रोकने में मदद करते हैं।",
    },
    {
      title: "दूसरी तिमाही",
      weeks: "14–27 सप्ताह",
      icon: "🌸",
      focus: "कैल्शियम, प्रोटीन और विटामिन डी की मात्रा बढ़ाएं।",
      foods: "दूध, दही, पनीर, रागी, दालें, मेवे",
      tip: "कैल्शियम युक्त स्नैक्स लें और हल्की सैर जारी रखें।",
    },
    {
      title: "तीसरी तिमाही",
      weeks: "28–40+ सप्ताह",
      icon: "🌷",
      focus: "शिशु के तीव्र विकास के लिए पौष्टिक भोजन और स्वस्थ वसा लें।",
      foods: "अखरोट, बादाम, दलिया, हरी सब्जियां, फल",
      tip: "एसिडिटी से बचने के लिए दिनभर में छोटे-छोटे भोजन लें।",
    },
  ],
  Tamil: [
    {
      title: "முதல் மூன்று மாதங்கள்",
      weeks: "1–13 வாரங்கள்",
      icon: "🌱",
      focus: "ஃபோலேட், போதுமான நீர் மற்றும் எளிய உணவுகளில் கவனம் செலுத்துங்கள்.",
      foods: "கீரைகள், பருப்பு வகைகள், பழங்கள்",
      tip: "இஞ்சி டீ மற்றும் பிஸ்கட் காலை வாந்தியைக் குறைக்க உதவும்.",
    },
    {
      title: "இரண்டாவது மூன்று மாதங்கள்",
      weeks: "14–27 வாரங்கள்",
      icon: "🌸",
      focus: "கால்சியம், புரதம் மற்றும் வைட்டமின் டி சத்துக்களை அதிகரியுங்கள்.",
      foods: "பால், தயிர், கேழ்வரகு, பன்னீர், காய்கறிகள்",
      tip: "ராகி கஞ்சி மற்றும் ஆரோக்கியமான சிற்றுண்டிகளை எடுத்துக் கொள்ளுங்கள்.",
    },
    {
      title: "மூன்றாவது மூன்று மாதங்கள்",
      weeks: "28–40+ வாரங்கள்",
      icon: "🌷",
      focus: "குழந்தையின் எடை அதிகரிப்புக்கு ஊட்டச்சத்து நிறைந்த உணவு அவசியம்.",
      foods: "நட்ஸ், விதைகள், பருப்புகள், புதிய பழங்கள்",
      tip: "செரிமானத்திற்காக சிறிய இடைவெளியில் உணவருந்துங்கள்.",
    },
  ],
  Telugu: [
    {
      title: "మొదటి త్రైమాసికం",
      weeks: "1–13 వారాలు",
      icon: "🌱",
      focus: "ఫోలేట్, తగినంత నీరు మరియు తేలికపాటి ఆహారంపై శ్రద్ధ వహించండి.",
      foods: "ఆకుకూరలు, పప్పులు, తాజా పండ్లు",
      tip: "అల్లం టీ మరియు బిస్కెట్లు మార్నింగ్ సిక్‌నెస్‌ను తగ్గిస్తాయి.",
    },
    {
      title: "రెండవ త్రైమాసికం",
      weeks: "14–27 వారాలు",
      icon: "🌸",
      focus: "కాల్షియం, ప్రొటీన్ మరియు విటమిన్ డి తీసుకోవడం పెంచండి.",
      foods: "పాలు, పెరుగు, రాగులు, పనీర్, బాదం",
      tip: "రాగి జావ మరియు కాల్షియం అధికంగా ఉండే ఆహారాలు తీసుకోండి.",
    },
    {
      title: "మూడవ త్రైమాసికం",
      weeks: "28–40+ వారాలు",
      icon: "🌷",
      focus: "శిశువు వేగవంతమైన ఎదుగుదలకు పోషక విలువలున్న ఆహారం అవసరం.",
      foods: "నట్స్, గింజలు, ఆకుకూరలు, పండ్లు",
      tip: "ఎసిడిటీ నివారణకు రోజులో కొద్దికొద్దిగా ఎక్కువసార్లు తినండి.",
    },
  ],
};

const WARNINGS_BY_LANG: Record<SupportedLanguage, { title: string; items: { icon: string; name: string; desc: string }[] }> = {
  English: {
    title: "🚫 Foods to Limit or Avoid",
    items: [
      { icon: "🍺", name: "Alcohol & Smoking", desc: "Completely avoid during entire pregnancy." },
      { icon: "🐟", name: "High-Mercury Fish", desc: "Avoid shark, swordfish, king mackerel." },
      { icon: "🥩", name: "Raw or Undercooked Foods", desc: "Avoid raw meat, uncooked eggs, unwashed vegetables." },
      { icon: "🥛", name: "Unpasteurized Dairy", desc: "Always choose pasteurized milk, cheese, and juices." },
    ],
  },
  Kannada: {
    title: "🚫 ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ತಪ್ಪಿಸಬೇಕಾದ ಆಹಾರಗಳು",
    items: [
      { icon: "🍺", name: "ಮದ್ಯಪಾನ ಮತ್ತು ಧೂಮಪಾನ", desc: "ಗರ್ಭಾವಸ್ಥೆಯ ಪೂರ್ತಿ ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ." },
      { icon: "🐟", name: "ಪಾದರಸ ಹೆಚ್ಚಿರುವ ಮೀನುಗಳು", desc: "ದೊಡ್ಡ ಜಾತಿಯ ಸಮುದ್ರದ ಮೀನುಗಳನ್ನು ಸೇವಿಸಬೇಡಿ." },
      { icon: "🥩", name: "ಬೇಯಿಸದ ಹಸಿ ಆಹಾರ", desc: "ಅರ್ಧ ಬೆಂದ ಮಾಂಸ, ಹಸಿ ಮೊಟ್ಟೆ ಸೇವಿಸಬೇಡಿ." },
      { icon: "🥛", name: "ಕುದಿಸದ ಹಸಿ ಹಾಲು", desc: "ಯಾವಾಗಲೂ ಚೆನ್ನಾಗಿ ಕಾಯಿಸಿದ ಹಾಲನ್ನೇ ಕುಡಿಯಿರಿ." },
    ],
  },
  Hindi: {
    title: "🚫 गर्भावस्था में इन चीजों से परहेज करें",
    items: [
      { icon: "🍺", name: "शराब और धूम्रपान", desc: "पूरी गर्भावस्था के दौरान पूरी तरह बचें।" },
      { icon: "🐟", name: "उच्च पारे वाली मछलियां", desc: "समुद्री बड़ी मछलियों से परहेज करें।" },
      { icon: "🥩", name: "कच्चा या अधपका भोजन", desc: "कच्चा अंडा या अधपका मांस न खाएं।" },
      { icon: "🥛", name: "बिना पाश्चुरीकृत दूध", desc: "हमेशा अच्छी तरह उबले दूध का ही सेवन करें।" },
    ],
  },
  Tamil: {
    title: "🚫 தவிர்க்க வேண்டிய உணவுகள்",
    items: [
      { icon: "🍺", name: "மது மற்றும் புகைபிடித்தல்", desc: "கர்ப்ப காலத்தில் முழுமையாக தவிர்க்கவும்." },
      { icon: "🐟", name: "அதிக பாதரசம் கொண்ட மீன்கள்", desc: "பெரிய கடல் மீன்களை தவிர்க்கவும்." },
      { icon: "🥩", name: "சமைக்கப்படாத பச்சையான உணவுகள்", desc: "முழுமையாக வேகவைத்த உணவுகளையே உண்ணுங்கள்." },
      { icon: "🥛", name: "காய்ச்சாத பால்", desc: "நன்கு காய்ச்சிய பாலையே அருந்தவும்." },
    ],
  },
  Telugu: {
    title: "🚫 నివారించవలసిన ఆహారాలు",
    items: [
      { icon: "🍺", name: "మద్యపానం & ధూమపానం", desc: "గర్భధారణ సమయంలో పూర్తిగా నివారించండి." },
      { icon: "🐟", name: "పాదరసం ఎక్కువ గల చేపలు", desc: "పెద్ద సముద్రపు చేపలను నివారించండి." },
      { icon: "🥩", name: "ఉడకని పచ్చి ఆహారాలు", desc: "పూర్తిగా ఉడికించిన ఆహారాలనే తినండి." },
      { icon: "🥛", name: "మరగబెట్టని పచ్చి పాలు", desc: "ఎల్లప్పుడూ బాగా కాచిన పాలనే వాడండి." },
    ],
  },
};

export default function Nutrition() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const nutrients = NUTRIENTS_BY_LANG[language] || NUTRIENTS_BY_LANG.English;
  const trimesters = TRIMESTERS_BY_LANG[language] || TRIMESTERS_BY_LANG.English;
  const warnings = WARNINGS_BY_LANG[language] || WARNINGS_BY_LANG.English;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBackOrReplace()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t.nutritionTitle}</Text>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🥗</Text>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              {t.appName}
            </Text>

            <Text style={styles.introText}>
              {t.nutritionSubtitle}
            </Text>
          </View>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Essential Nutrients / ಪೋಷಕಾಂಶಗಳು</Text>

        {/* Nutrient cards */}
        {nutrients.map((nutrient) => (
          <View style={styles.nutrientCard} key={nutrient.name}>
            <View style={styles.iconContainer}>
              <Text style={styles.nutrientIcon}>{nutrient.icon}</Text>
            </View>

            <View style={styles.nutrientContent}>
              <Text style={styles.nutrientName}>{nutrient.name}</Text>

              <Text style={styles.benefit}>{nutrient.benefit}</Text>

              <Text style={styles.foodsLabel}>Good sources / ಆಹಾರಗಳು</Text>

              <Text style={styles.foods}>{nutrient.foods}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.foodGuideButton}
          onPress={() => router.push("/foodguide")}
        >
          <Text style={styles.foodGuideIcon}>🍎</Text>

          <View style={styles.foodGuideContent}>
            <Text style={styles.foodGuideTitle}>{t.foodGuideTitle}</Text>

            <Text style={styles.foodGuideText}>
              {t.foodGuideSubtitle}
            </Text>
          </View>

          <Text style={styles.foodGuideArrow}>›</Text>
        </TouchableOpacity>

        {/* Avoid / Warnings */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>{warnings.title}</Text>

          {warnings.items.map((item, idx) => (
            <View style={styles.warningItem} key={idx}>
              <Text style={styles.warningIcon}>{item.icon}</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningItemTitle}>{item.name}</Text>
                <Text style={styles.warningItemText}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trimesters */}
        <Text style={styles.sectionTitle}>{t.trimester} Guide</Text>

        {trimesters.map((trimester) => (
          <View style={styles.trimesterCard} key={trimester.title}>
            <View style={styles.trimesterHeader}>
              <View style={styles.trimesterIconContainer}>
                <Text style={styles.trimesterIcon}>{trimester.icon}</Text>
              </View>

              <View style={styles.trimesterTitleContainer}>
                <Text style={styles.trimesterTitle}>
                  {trimester.title}
                </Text>

                <Text style={styles.trimesterWeeks}>
                  {trimester.weeks}
                </Text>
              </View>
            </View>

            <Text style={styles.trimesterLabel}>Nutrition Focus</Text>
            <Text style={styles.trimesterText}>{trimester.focus}</Text>

            <Text style={styles.trimesterLabel}>Recommended Foods</Text>
            <Text style={styles.trimesterText}>{trimester.foods}</Text>

            <View style={styles.trimesterTip}>
              <Text style={styles.trimesterTipText}>💡 {trimester.tip}</Text>
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {t.disclaimer}
        </Text>
      </ScrollView>

      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F5EFE6",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 32,
    color: "#6E5B4B",
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#46382E",
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F5EFE6",
    borderWidth: 1,
    borderColor: "#E2D5C3",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6E5B4B",
  },
  introCard: {
    backgroundColor: "#F7F0E6",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  introEmoji: {
    fontSize: 34,
    marginRight: 14,
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#46382E",
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: "#776558",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#46382E",
    marginBottom: 14,
  },
  nutrientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7F0E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  nutrientIcon: {
    fontSize: 24,
  },
  nutrientContent: {
    flex: 1,
  },
  nutrientName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#46382E",
    marginBottom: 4,
  },
  benefit: {
    fontSize: 13,
    color: "#776558",
    lineHeight: 18,
    marginBottom: 8,
  },
  foodsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9C7960",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  foods: {
    fontSize: 13,
    color: "#3F3229",
    fontWeight: "600",
  },
  foodGuideButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#EFE5D8",
  },
  foodGuideIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  foodGuideContent: {
    flex: 1,
  },
  foodGuideTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#46382E",
    marginBottom: 2,
  },
  foodGuideText: {
    fontSize: 12,
    color: "#776558",
  },
  foodGuideArrow: {
    fontSize: 24,
    color: "#A28F81",
    marginLeft: 8,
  },
  warningCard: {
    backgroundColor: "#FFF2F2",
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F7D6D6",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#8B2E2E",
    marginBottom: 14,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningItemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6E2222",
    marginBottom: 2,
  },
  warningItemText: {
    fontSize: 12,
    color: "#834A4A",
    lineHeight: 17,
  },
  trimesterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  trimesterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  trimesterIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F0E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  trimesterIcon: {
    fontSize: 22,
  },
  trimesterTitleContainer: {
    flex: 1,
  },
  trimesterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#46382E",
  },
  trimesterWeeks: {
    fontSize: 12,
    color: "#8B7465",
    marginTop: 2,
  },
  trimesterLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9C7960",
    marginTop: 8,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  trimesterText: {
    fontSize: 13,
    color: "#5C4B40",
    lineHeight: 18,
  },
  trimesterTip: {
    backgroundColor: "#FFF9F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  trimesterTipText: {
    fontSize: 12,
    color: "#7A5A30",
    lineHeight: 17,
  },
  disclaimer: {
    fontSize: 12,
    color: "#968375",
    lineHeight: 17,
    textAlign: "center",
    marginTop: 10,
  },
});