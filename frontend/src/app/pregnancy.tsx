import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "../utils/storage";
import { getPregnancyProfile } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type WeekMaternalInfo = {
  week: number;
  stageName: string;
  stageEmoji: string;
  motherBody: string;
  symptoms: string[];
  weeklyTip: string;
  nutrientFocus: string;
  trimester: 1 | 2 | 3;
};

const WEEKS_DATA_EN: Record<number, WeekMaternalInfo> = {
  1: {
    week: 1,
    stageName: "Preparation & Conception",
    stageEmoji: "🌱",
    motherBody: "Your uterine lining is thickening to prepare for fertilization. Your body is starting its delicate hormonal harmony.",
    symptoms: ["Mild cramping", "Slight body temperature rise", "Mood sensitivity"],
    weeklyTip: "Begin taking 400–600 mcg of daily folic acid to build essential reserves early.",
    nutrientFocus: "Folic Acid & Hydration",
    trimester: 1,
  },
  4: {
    week: 4,
    stageName: "Early Implantation",
    stageEmoji: "🌸",
    motherBody: "HCG hormone production begins surging. Your breasts may feel sensitive, and you may notice slight fatigue.",
    symptoms: ["Tender breasts", "Mild fatigue", "Light spotting or cramping"],
    weeklyTip: "Schedule your confirmation visit and avoid unpasteurized foods or medications without doctor advice.",
    nutrientFocus: "Folate & Vitamin B6",
    trimester: 1,
  },
  8: {
    week: 8,
    stageName: "Peak Hormone Surge",
    stageEmoji: "✨",
    motherBody: "Blood volume is expanding to nourish the pregnancy. Morning sickness and heighted senses can be prominent.",
    symptoms: ["Nausea / Morning sickness", "Food aversions", "Heightened sense of smell", "Frequent urination"],
    weeklyTip: "Keep dry plain crackers by your bed and drink ginger tea or lemon water throughout the day.",
    nutrientFocus: "Vitamin B6, Iron & Electrolytes",
    trimester: 1,
  },
  12: {
    week: 12,
    stageName: "Completing First Trimester",
    stageEmoji: "🌷",
    motherBody: "Your uterus is gently lifting out of the pelvis. Early morning nausea often begins to soften and subside.",
    symptoms: ["Increased energy returning", "Occasional mild headaches", "Skin glow"],
    weeklyTip: "Time for your 12-week comprehensive ultrasound and first-trimester clinical check-up.",
    nutrientFocus: "Calcium, Vitamin D & Fiber",
    trimester: 1,
  },
  16: {
    week: 16,
    stageName: "Second Trimester Glow",
    stageEmoji: "☀️",
    motherBody: "Your baby bump may now be showing subtly. Cardiovascular blood flow is higher, giving you that radiant pregnancy glow.",
    symptoms: ["Round ligament twinges", "Increased appetite", "Clearer nasal passages"],
    weeklyTip: "Wear comfortable supportive footwear and stay active with gentle daily walks or doctor-approved prenatal yoga.",
    nutrientFocus: "Iron & Vitamin C",
    trimester: 2,
  },
  20: {
    week: 20,
    stageName: "Halfway Milestone",
    stageEmoji: "🌿",
    motherBody: "You are officially at the midpoint! The uterus reaches the height of your belly button. First gentle flutter kicks can be felt.",
    symptoms: ["Fluttery kick sensations", "Heartburn or mild indigestion", "Lower back tightness"],
    weeklyTip: "Attend your mid-pregnancy anatomy ultrasound scan and start practicing sleeping on your left side.",
    nutrientFocus: "Omega-3 DHA & Choline",
    trimester: 2,
  },
  24: {
    week: 24,
    stageName: "Active Vitality Stage",
    stageEmoji: "🌺",
    motherBody: "Skin on belly and breasts stretches gently. Your centre of gravity shifts as the belly expands.",
    symptoms: ["Itchy stretching belly skin", "Leg cramps, especially at night", "Mild ankle swelling"],
    weeklyTip: "Use gentle moisturizers on your belly and do gentle ankle rotations before bedtime to reduce cramps.",
    nutrientFocus: "Magnesium & Potassium",
    trimester: 2,
  },
  28: {
    week: 28,
    stageName: "Entering Third Trimester",
    stageEmoji: "🌼",
    motherBody: "Welcome to the home stretch! The expanding uterus can push against your diaphragm and stomach.",
    symptoms: ["Shortness of breath on exertion", "Mild backache", "Vivid dreams"],
    weeklyTip: "Get your maternal Tdap vaccine booster between weeks 27 and 36, and screen for gestational diabetes if advised.",
    nutrientFocus: "Iron, Protein & Calcium",
    trimester: 3,
  },
  32: {
    week: 32,
    stageName: "Late Pregnancy Maturation",
    stageEmoji: "🕊️",
    motherBody: "Your body is naturally preparing for labor. Gentle practice contractions (Braxton Hicks) may occur intermittently.",
    symptoms: ["Braxton Hicks practice contractions", "Frequent bathroom visits", "Difficulty finding comfortable sleep positions"],
    weeklyTip: "Support your back and belly with a specialized pregnancy body pillow, and stay well hydrated.",
    nutrientFocus: "Electrolytes & High-Fiber Foods",
    trimester: 3,
  },
  36: {
    week: 36,
    stageName: "Final Preparation Stage",
    stageEmoji: "💖",
    motherBody: "Your baby may engage ('drop') lower into your pelvis ('lightening'). Breathing becomes easier, though pelvic pressure increases.",
    symptoms: ["Pelvic pressure", "Nesting instinct", "Swollen ankles after standing"],
    weeklyTip: "Pack your hospital bag, finalize your birth preferences, and start weekly doctor consultations.",
    nutrientFocus: "Protein & Complex Carbs",
    trimester: 3,
  },
  40: {
    week: 40,
    stageName: "Full Term & Delivery Readiness",
    stageEmoji: "🎉",
    motherBody: "Your body is completely primed for labor. The cervix softens and thins out (effacement).",
    symptoms: ["Frequent strong practice contractions", "Lower back ache", "Restlessness or deep fatigue"],
    weeklyTip: "Rest as much as possible, practice rhythmic calming breathing, and watch for true labor signs (water breaking, regular contractions).",
    nutrientFocus: "Easily Digestible Energizing Foods & Water",
    trimester: 3,
  },
};

const WEEKS_DATA_KN: Record<number, WeekMaternalInfo> = {
  1: {
    week: 1,
    stageName: "ತಯಾರಿ ಮತ್ತು ಗರ್ಭಧಾರಣೆ",
    stageEmoji: "🌱",
    motherBody: "ನಿಮ್ಮ ಗರ್ಭಾಶಯವು ಫಲವತ್ತತೆಗಾಗಿ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ. ದೇಹದಲ್ಲಿ ಹಾರ್ಮೋನ್ ಸಮ್ಮಿಲನ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.",
    symptoms: ["ಸಣ್ಣ ಹೊಟ್ಟೆ ನೋವು", "ದೇಹದ ಉಷ್ಣತೆ ಸ್ವಲ್ಪ ಹೆಚ್ಚಳ", "ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ"],
    weeklyTip: "ದೈನಂದಿನ 400-600 ಎಂಸಿಜಿ ಫೋಲಿಕ್ ಆಸಿಡ್ ತೆಗೆದುಕೊಳ್ಳಲು ಪ್ರಾರಂಭಿಸಿ.",
    nutrientFocus: "ಫೋಲಿಕ್ ಆಮ್ಲ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು",
    trimester: 1,
  },
  4: {
    week: 4,
    stageName: "ಆರಂಭಿಕ ಹಂತ",
    stageEmoji: "🌸",
    motherBody: "HCG ಹಾರ್ಮೋನ್ ಉತ್ಪಾದನೆ ಹೆಚ್ಚುತ್ತದೆ. ಸ್ತನಗಳು ಮೃದುವಾಗಿರಬಹುದು ಮತ್ತು ಆಯಾಸ ಉಂಟಾಗಬಹುದು.",
    symptoms: ["ಸ್ತನಗಳ ಸೂಕ್ಷ್ಮತೆ", "ಆಯಾಸ", "ಸಣ್ಣ ಸೆಳೆತ"],
    weeklyTip: "ವೈದ್ಯರ ಬಳಿ ಭೇಟಿ ನೀಡಿ ಹಾಗೂ ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.",
    nutrientFocus: "ಫೋಲೇಟ್ ಮತ್ತು ವಿಟಮಿನ್ ಬಿ6",
    trimester: 1,
  },
  8: {
    week: 8,
    stageName: "ಹಾರ್ಮೋನ್ ಹೆಚ್ಚಳದ ಹಂತ",
    stageEmoji: "✨",
    motherBody: "ಗರ್ಭಕ್ಕೆ ಪೋಷಣೆ ನೀಡಲು ರಕ್ತದ ಪ್ರಮಾಣ ಹೆಚ್ಚುತ್ತದೆ. ವಾಕರಿಕೆ ಮತ್ತು ಸುಸ್ತು ಸಾಮಾನ್ಯ.",
    symptoms: ["ಬೆಳಗಿನ ವಾಕರಿಕೆ", "ಆಹಾರದಲ್ಲಿ ಒಲವಿಲ್ಲದಿರುವುದು", "ವಾಸನೆ ಗ್ರಹಿಕೆ ಹೆಚ್ಚಳ", "ಪದೇ ಪದೇ ಮೂತ್ರ ವಿಸರ್ಜನೆ"],
    weeklyTip: "ಹಾಸಿಗೆಯ ಪಕ್ಕ ಒಣ ಬಿಸ್ಕತ್ತು ಇಟ್ಟುಕೊಳ್ಳಿ, ಶುಂಠಿ ಚಹಾ ಅಥವಾ ನಿಂಬೆ ನೀರು ಕುಡಿಯಿರಿ.",
    nutrientFocus: "ವಿಟಮಿನ್ ಬಿ6, ಕಬ್ಬಿಣ ಮತ್ತು ಎಲೆಕ್ಟ್ರೋಲೈಟ್‌ಗಳು",
    trimester: 1,
  },
  12: {
    week: 12,
    stageName: "ಮೊದಲ ತ್ರೈಮಾಸಿಕದ ಪೂರ್ಣತೆ",
    stageEmoji: "🌷",
    motherBody: "ಗರ್ಭಾಶಯವು ಶ್ರೋಣಿಯ ಮೇಲಕ್ಕೆ ಏರುತ್ತದೆ. ಮುಂಜಾನೆಯ ವಾಕರಿಕೆ ಕಡಿಮೆಯಾಗಲು ಆರಂಭವಾಗುತ್ತದೆ.",
    symptoms: ["ಹೆಚ್ಚಿದ ಶಕ್ತಿ ಮರಳುವುದು", "ಸೌಮ್ಯ ತಲೆನೋವು", "ಮುಖದ ಕಾಂತಿ"],
    weeklyTip: "12 ವಾರಗಳ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ವೈದ್ಯರ ತಪಾಸಣೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.",
    nutrientFocus: "ಕ್ಯಾಲ್ಸಿಯಂ, ವಿಟಮಿನ್ ಡಿ ಮತ್ತು ನಾರಿನಂಶ",
    trimester: 1,
  },
  16: {
    week: 16,
    stageName: "ಎರಡನೇ ತ್ರೈಮಾಸಿಕದ ಕಾಂತಿ",
    stageEmoji: "☀️",
    motherBody: "ಹೊಟ್ಟೆಯು ನಿಧಾನವಾಗಿ ಗೋಚರಿಸಬಹುದು. ರಕ್ತಪರಿಚಲನೆ ಉತ್ತಮಗೊಂಡು ಮುಖದಲ್ಲಿ ವಿಶೇಷ ಕಾಂತಿ ಮೂಡುತ್ತದೆ.",
    symptoms: ["ಸಣ್ಣ ಹೊಟ್ಟೆ ಸೆಳೆತ", "ಹೆಚ್ಚಿದ ಹಸಿವು", "ಉಸಿರಾಟ ಸರಾಗ"],
    weeklyTip: "ಆರಾಮದಾಯಕ ಚಪ್ಪಲಿ ಬಳಸಿ, ಪ್ರತಿದಿನ ಲಘು ನಡಿಗೆ ಅಥವಾ ಪ್ರಸವಪೂರ್ವ ಯೋಗ ಮಾಡಿ.",
    nutrientFocus: "ಕಬ್ಬಿಣ ಮತ್ತು ವಿಟಮಿನ್ ಸಿ",
    trimester: 2,
  },
  20: {
    week: 20,
    stageName: "ಅರ್ಧ ಮೈಲಿಗಲ್ಲು",
    stageEmoji: "🌿",
    motherBody: "ನೀವು ಅರ್ಧ ಹಂತ ತಲುಪಿದ್ದೀರಿ! ಮಗುವಿನ ಮೊದಲ ಸೂಕ್ಷ್ಮ ಚಲನೆಗಳನ್ನು ಅನುಭವಿಸಬಹುದು.",
    symptoms: ["ಮಗುವಿನ ಸಣ್ಣ ಚಲನೆಗಳು", "ಎದೆಯುರಿ", "ಬೆನ್ನು ನೋವು"],
    weeklyTip: "ಅನಾಟಮಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಎಡಭಾಗಕ್ಕೆ ತಿರುಗಿ ಮಲಗಲು ಅಭ್ಯಾಸ ಮಾಡಿ.",
    nutrientFocus: "ಒಮೆಗಾ-3 ಡಿಎಚ್‌ಎ ಮತ್ತು ಕೋಲಿನ್",
    trimester: 2,
  },
  24: {
    week: 24,
    stageName: "ಸಕ್ರಿಯ ಚೈತನ್ಯದ ಹಂತ",
    stageEmoji: "🌺",
    motherBody: "ಹೊಟ್ಟೆಯ ಚರ್ಮವು ಹಿಗ್ಗುತ್ತದೆ. ದೇಹದ ಸಮತೋಲನ ಬದಲಾಗುತ್ತದೆ.",
    symptoms: ["ಹೊಟ್ಟೆಯ ಚರ್ಮದಲ್ಲಿ ತುರಿಕೆ", "ರಾತ್ರಿ ಕಾಲಿನ ಸೆಳೆತ", "ಪಾದಗಳ ಸಣ್ಣ ಊತ"],
    weeklyTip: "ಹೊಟ್ಟೆಗೆ ಸೌಮ್ಯ ಮಾಯಿಶ್ಚರೈಸರ್ ಹಚ್ಚಿ, ನಿದ್ರೆಗೆ ಮುನ್ನ ಪಾದಗಳ ಲಘು ವ್ಯಾಯಾಮ ಮಾಡಿ.",
    nutrientFocus: "ಮೆಗ್ನೀಸಿಯಮ್ ಮತ್ತು ಪೊಟ್ಯಾಸಿಯಮ್",
    trimester: 2,
  },
  28: {
    week: 28,
    stageName: "ಮೂರನೇ ತ್ರೈಮಾಸಿಕ ಪ್ರವೇಶ",
    stageEmoji: "🌼",
    motherBody: "ಅಂತಿಮ ಹಂತಕ್ಕೆ ಸುಸ್ವಾಗತ! ಹೊಟ್ಟೆ ದೊಡ್ಡದಾಗುತ್ತಿದ್ದಂತೆ ಉಸಿರಾಟದಲ್ಲಿ ಆಯಾಸವಾಗಬಹುದು.",
    symptoms: ["ಸುಲಭವಾಗಿ ಉಸಿರುಕಟ್ಟುವುದು", "ಬೆನ್ನು ನೋವು", "ಸ್ಪಷ್ಟ ಕನಸುಗಳು"],
    weeklyTip: "27 ರಿಂದ 36 ವಾರಗಳ ನಡುವೆ Tdap ಲಸಿಕೆ ಪಡೆಯಿರಿ ಹಾಗೂ ಸಕ್ಕರೆ ಕಾಯಿಲೆ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.",
    nutrientFocus: "ಕಬ್ಬಿಣ, ಪ್ರೋಟೀನ್ ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ",
    trimester: 3,
  },
  32: {
    week: 32,
    stageName: "ಅಂತಿಮ ಪಕ್ವತೆ",
    stageEmoji: "🕊️",
    motherBody: "ದೇಹವು ಹೆರಿಗೆಗೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ. ಬ್ರಾಕ್ಸ್‌ಟನ್ ಹಿಕ್ಸ್ ಅಭ್ಯಾಸದ ಸಂಕೋಚನಗಳು ಸಂಭವಿಸಬಹುದು.",
    symptoms: ["ಅಭ್ಯಾಸದ ಸಂಕೋಚನಗಳು", "ಪದೇ ಪದೇ ಮೂತ್ರ", "ನಿದ್ರೆಯಲ್ಲಿ ಅಸ್ವಸ್ಥತೆ"],
    weeklyTip: "ಗರ್ಭಧಾರಣೆಯ ದಿಂಬು ಬಳಸಿ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.",
    nutrientFocus: "ಎಲೆಕ್ಟ್ರೋಲೈಟ್‌ಗಳು ಮತ್ತು ನಾರಿನಂಶದ ಆಹಾರ",
    trimester: 3,
  },
  36: {
    week: 36,
    stageName: "ಅಂತಿಮ ಸಿದ್ಧತೆ",
    stageEmoji: "💖",
    motherBody: "ಮಗು ಶ್ರೋಣಿಯೊಳಗೆ ಇಳಿಯಬಹುದು. ಉಸಿರಾಟ ಸುಲಭವಾಗುತ್ತದೆ ಆದರೆ ಶ್ರೋಣಿಯ ಒತ್ತಡ ಹೆಚ್ಚುತ್ತದೆ.",
    symptoms: ["ಶ್ರೋಣಿಯ ಒತ್ತಡ", "ಹೆಚ್ಚು ಸ್ವಚ್ಛತೆಯ ಉತ್ಸಾಹ", "ಪಾದಗಳ ಊತ"],
    weeklyTip: "ಆಸ್ಪತ್ರೆಯ ಬ್ಯಾಗ್ ಸಿದ್ಧಪಡಿಸಿ, ಸಾಪ್ತಾಹಿಕ ವೈದ್ಯರ ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ.",
    nutrientFocus: "ಪ್ರೋಟೀನ್ ಮತ್ತು ಸಂಕೀರ್ಣ ಕಾರ್ಬೋಹೈಡ್ರೇಟ್‌ಗಳು",
    trimester: 3,
  },
  40: {
    week: 40,
    stageName: "ಪೂರ್ಣಾವಧಿ ಮತ್ತು ಹೆರಿಗೆ ಸನ್ನದ್ಧತೆ",
    stageEmoji: "🎉",
    motherBody: "ನಿಮ್ಮ ದೇಹವು ಹೆರಿಗೆಗೆ ಸಂಪೂರ್ಣ ಸಿದ್ಧವಾಗಿದೆ. ಗರ್ಭಕಂಠವು ಮೃದುವಾಗುತ್ತದೆ.",
    symptoms: ["ಬಲವಾದ ಸಂಕೋಚನಗಳು", "ಕೆಳಬೆನ್ನು ನೋವು", "ಆಯಾಸ"],
    weeklyTip: "ಸಾಧ್ಯವಾದಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಹೆರಿಗೆಯ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.",
    nutrientFocus: "ಸುಲಭವಾಗಿ ಜೀರ್ಣವಾಗುವ ಆಹಾರ ಮತ್ತು ನೀರು",
    trimester: 3,
  },
};

const WEEKS_DATA_HI: Record<number, WeekMaternalInfo> = {
  1: {
    week: 1,
    stageName: "तैयारी और गर्भाधान",
    stageEmoji: "🌱",
    motherBody: "गर्भाशय की परत निषेचन के लिए तैयार हो रही है। शरीर में हार्मोनल संतुलन शुरू होता है।",
    symptoms: ["हल्के ऐंठन", "शरीर के तापमान में मामूली वृद्धि", "मूड में बदलाव"],
    weeklyTip: "दैनिक 400-600 एमसीजी फोलिक एसिड लेना शुरू करें।",
    nutrientFocus: "फोलिक एसिड और भरपूर पानी",
    trimester: 1,
  },
  4: {
    week: 4,
    stageName: "प्रारंभिक चरण",
    stageEmoji: "🌸",
    motherBody: "HCG हार्मोन का स्तर बढ़ता है। स्तनों में संवेदनशीलता और थकान महसूस हो सकती है।",
    symptoms: ["स्तनों में दर्द", "हल्की थकान", "हल्के ऐंठन"],
    weeklyTip: "डॉक्टर से मिलने का समय तय करें और बिना सलाह के कोई दवा न लें।",
    nutrientFocus: "फोलेट और विटामिन बी6",
    trimester: 1,
  },
  8: {
    week: 8,
    stageName: "हार्मोनल बदलाव का चरम",
    stageEmoji: "✨",
    motherBody: "गर्भ के पोषण के लिए रक्त की मात्रा बढ़ रही है। मॉर्निंग सिकनेस आम है।",
    symptoms: ["जी मिचलाना / उल्टी", "खाने से अरुचि", "सूंघने की शक्ति बढ़ना", "बार-बार पेशाब"],
    weeklyTip: "बिस्तर के पास सूखे बिस्कुट रखें और दिनभर अदरक की चाय या नींबू पानी पिएं।",
    nutrientFocus: "विटामिन बी6, आयरन और इलेक्ट्रोलाइट्स",
    trimester: 1,
  },
  12: {
    week: 12,
    stageName: "पहली तिमाही का समापन",
    stageEmoji: "🌷",
    motherBody: "गर्भाशय श्रोणि से ऊपर उठ रहा है। सुबह की उल्टी कम होने लगती है।",
    symptoms: ["ऊर्जा वापस आना", "हल्का सिरदर्द", "चेहरे पर चमक"],
    weeklyTip: "12 सप्ताह का अल्ट्रासाउंड और नियमित जांच करवाएं।",
    nutrientFocus: "कैल्शियम, विटामिन डी और फाइबर",
    trimester: 1,
  },
  16: {
    week: 16,
    stageName: "दूसरी तिमाही की चमक",
    stageEmoji: "☀️",
    motherBody: "पेट हल्का सा दिखने लग सकता है। रक्त संचार बेहतर होने से चेहरे पर निखार आता है।",
    symptoms: ["पेट में हल्का खिंचाव", "भूख बढ़ना", "सांसें साफ होना"],
    weeklyTip: "आरामदायक जूते पहनें और हल्की सैर या डॉक्टर की सलाह पर योग करें।",
    nutrientFocus: "आयरन और विटामिन सी",
    trimester: 2,
  },
  20: {
    week: 20,
    stageName: "आधा सफर पूरा",
    stageEmoji: "🌿",
    motherBody: "आप सफर के आधे पड़ाव पर हैं! बच्चे की पहली हल्की हलचल महसूस हो सकती है।",
    symptoms: ["बच्चे की हल्की हलचल", "सीने में जलन", "कमर दर्द"],
    weeklyTip: "अनाटॉमी स्कैन करवाएं और बाईं करवट सोने की आदत डालें।",
    nutrientFocus: "ओमेगा-3 डीएचए और कोलीन",
    trimester: 2,
  },
  24: {
    week: 24,
    stageName: "सक्रिय ऊर्जा का चरण",
    stageEmoji: "🌺",
    motherBody: "पेट की त्वचा फैल रही है। शरीर का संतुलन बदलता है।",
    symptoms: ["पेट की त्वचा में खुजली", "पैरों में ऐंठन", "टखनों में हल्की सूजन"],
    weeklyTip: "पेट पर सौम्य मॉइस्चराइज़र लगाएं और सोने से पहले पैरों को हल्का घुमाएं।",
    nutrientFocus: "मैग्नीशियम और पोटेशियम",
    trimester: 2,
  },
  28: {
    week: 28,
    stageName: "तीसरी तिमाही में प्रवेश",
    stageEmoji: "🌼",
    motherBody: "अंतिम तिमाही में स्वागत है! बढ़ता हुआ गर्भाशय सांस लेने में कठिनाई पैदा कर सकता है।",
    symptoms: ["सांस फूलना", "कमर दर्द", "गहरे सपने"],
    weeklyTip: "27 से 36 सप्ताह के बीच Tdap टीका लगवाएं और शुगर जांच करवाएं।",
    nutrientFocus: "आयरन, प्रोटीन और कैल्शियम",
    trimester: 3,
  },
  32: {
    week: 32,
    stageName: "परिपक्वता चरण",
    stageEmoji: "🕊️",
    motherBody: "शरीर प्रसव की तैयारी कर रहा है। हल्के संकुचन (ब्रैक्सटन हिक्स) हो सकते हैं।",
    symptoms: ["अभ्यास संकुचन", "बार-बार पेशाब", "सोने में असुविधा"],
    weeklyTip: "प्रेगनेंसी पिलो का इस्तेमाल करें और पर्याप्त पानी पिएं।",
    nutrientFocus: "इलेक्ट्रोलाइट्स और उच्च फाइबर युक्त आहार",
    trimester: 3,
  },
  36: {
    week: 36,
    stageName: "अंतिम तैयारी",
    stageEmoji: "💖",
    motherBody: "शिशु श्रोणि में नीचे आ सकता है। सांस लेना आसान होता है पर दबाव बढ़ता है।",
    symptoms: ["श्रोणि पर दबाव", "सफाई का उत्साह", "पैरों में सूजन"],
    weeklyTip: "हॉस्पिटल बैग तैयार करें और साप्ताहिक डॉक्टर जांच शुरू करें।",
    nutrientFocus: "प्रोटीन और जटिल कार्बोहाइड्रेट",
    trimester: 3,
  },
  40: {
    week: 40,
    stageName: "पूर्ण अवधि एवं प्रसव तत्परता",
    stageEmoji: "🎉",
    motherBody: "शरीर प्रसव के लिए पूरी तरह तैयार है। गर्भाशय ग्रीवा नरम हो रही है।",
    symptoms: ["तेज संकुचन", "निचली कमर में दर्द", "थकान"],
    weeklyTip: "जितना हो सके आराम करें और प्रसव के लक्षणों पर ध्यान दें।",
    nutrientFocus: "सुपाच्य ऊर्जावान भोजन और पानी",
    trimester: 3,
  },
};

const WEEKS_DATA_TA: Record<number, WeekMaternalInfo> = {
  1: {
    week: 1,
    stageName: "தயாரிப்பு மற்றும் கருத்தரித்தல்",
    stageEmoji: "🌱",
    motherBody: "கருவுறுதலுக்கு கருப்பை தயாராகிறது. உடலில் ஹார்மோன் மாற்றங்கள் தொடங்குகின்றன.",
    symptoms: ["லேசான வலி", "உடல் வெப்பநிலை அதிகரிப்பு", "மனநிலை உணர்திறன்"],
    weeklyTip: "தினமும் 400-600 எம்.சி.ஜி ஃபோலிக் அமிலம் எடுக்கத் தொடங்குங்கள்.",
    nutrientFocus: "ஃபோலிக் அமிலம் மற்றும் நீர்ச்சத்து",
    trimester: 1,
  },
  4: {
    week: 4,
    stageName: "ஆரம்ப நிலை",
    stageEmoji: "🌸",
    motherBody: "HCG ஹார்மோன் சுரப்பு அதிகரிக்கிறது. மார்பகங்கள் மென்மையாகவும், சோர்வாகவும் உணரலாம்.",
    symptoms: ["மார்பக வலி", "லேசான சோர்வு", "லேசான தசைப்பிடிப்பு"],
    weeklyTip: "மருத்துவரை அணுகி பரிசோதனை செய்யுங்கள், சுயமருத்துவம் தவிர்க்கவும்.",
    nutrientFocus: "ஃபோலேட் மற்றும் வைட்டமின் பி6",
    trimester: 1,
  },
  8: {
    week: 8,
    stageName: "ஹார்மோன் மாற்றங்களின் உச்சம்",
    stageEmoji: "✨",
    motherBody: "கருவுக்கு ஊட்டமளிக்க இரத்த ஓட்டம் அதிகரிக்கிறது. காலை நேர வாந்தி சாதாரணம்.",
    symptoms: ["காலை வாந்தி", "உணவு வெறுப்பு", "வாசனை உணர்வு அதிகரிப்பு", "அடிக்கடி சிறுநீர்"],
    weeklyTip: "அருகில் உலர்ந்த பிஸ்கட் வைத்திருங்கள், இஞ்சி டீ அல்லது எலுமிச்சை நீர் குடியுங்கள்.",
    nutrientFocus: "வைட்டமின் பி6, இரும்புச்சத்து மற்றும் எலக்ட்ரோலைட்டுகள்",
    trimester: 1,
  },
  12: {
    week: 12,
    stageName: "முதல் மூன்று மாதங்களின் நிறைவு",
    stageEmoji: "🌷",
    motherBody: "கருப்பை மேல்நோக்கி வளர்கிறது. காலை வாந்தி படிப்படியாக குறைகிறது.",
    symptoms: ["ஆற்றல் திரும்புதல்", "லேசான தலைவலி", "முகப் பொலிவு"],
    weeklyTip: "12 வார அல்ட்ராசவுண்ட் ஸ்கேன் மற்றும் மருத்துவ பரிசோதனை செய்துகொள்ளுங்கள்.",
    nutrientFocus: "கால்சியம், வைட்டமின் டி மற்றும் நார்ச்சத்து",
    trimester: 1,
  },
  16: {
    week: 16,
    stageName: "இரண்டாவது மூன்று மாதப் பொலிவு",
    stageEmoji: "☀️",
    motherBody: "வயிறு சற்று தெரியத் தொடங்கும். முகத்தில் அழகான கர்ப்பகால பொலிவு தோன்றும்.",
    symptoms: ["வயிற்று தசைப்பிடிப்பு", "அதிகரித்த பசி", "சுவாச வசதி"],
    weeklyTip: "சரியான காலணி அணியுங்கள், தினமும் லேசான நடைப்பயிற்சி செய்யுங்கள்.",
    nutrientFocus: "இரும்புச்சத்து மற்றும் வைட்டமின் சி",
    trimester: 2,
  },
  20: {
    week: 20,
    stageName: "பாதி மைல்கல்",
    stageEmoji: "🌿",
    motherBody: "நீங்கள் பாதி வழியை அடைந்துவிட்டீர்கள்! குழந்தையின் மெல்லிய அசைவுகளை உணரலாம்.",
    symptoms: ["குழந்தையின் மெல்லிய அசைவு", "நெஞ்செரிச்சல்", "முதுகு வலி"],
    weeklyTip: "அனாடமி ஸ்கேன் எடுத்துக்கொள்ளுங்கள் மற்றும் இடதுபுறம் படுக்கப் பழகுங்கள்.",
    nutrientFocus: "ஒமேகா-3 டி.ஹெச்.ஏ மற்றும் கோலின்",
    trimester: 2,
  },
  24: {
    week: 24,
    stageName: "சுறுசுறுப்பான நிலை",
    stageEmoji: "🌺",
    motherBody: "வயிற்றுத் தோல் விரிகிறது. உடல் சமநிலை மாறுகிறது.",
    symptoms: ["வயிற்று அரிப்பு", "இரவு கால் தசைப்பிடிப்பு", "கால் வீக்கம்"],
    weeklyTip: "வயிற்றில் மாய்ஸ்சரைசர் தடவுங்கள் மற்றும் கணுக்கால் பயிற்சி செய்யுங்கள்.",
    nutrientFocus: "மெக்னீசியம் மற்றும் பொட்டாசியம்",
    trimester: 2,
  },
  28: {
    week: 28,
    stageName: "மூன்றாவது மூன்று மாதங்கள்",
    stageEmoji: "🌼",
    motherBody: "இறுதி நிலைக்கு நல்வரவு! வயிறு பெரிதாவதால் மூச்சு விடுவதில் சிரமம் இருக்கலாம்.",
    symptoms: ["மூச்சுத் திணறல்", "முதுகு வலி", "தெளிவான கனவுகள்"],
    weeklyTip: "27-36 வாரங்களுக்குள் Tdap தடுப்பூசி பெற்றுக்கொள்ளுங்கள்.",
    nutrientFocus: "இரும்புச்சத்து, புரதம் மற்றும் கால்சியம்",
    trimester: 3,
  },
  32: {
    week: 32,
    stageName: "முதிர்ச்சி நிலை",
    stageEmoji: "🕊️",
    motherBody: "உடல் பிரசவத்திற்கு தயாராகிறது. லேசான சுருக்கங்கள் ஏற்படலாம்.",
    symptoms: ["போலி பிரசவ வலிகள்", "அடிக்கடி சிறுநீர்", "தூக்கமின்மை"],
    weeklyTip: "கர்ப்பகால தலையணையைப் பயன்படுத்தி போதுமான நீர் அருந்துங்கள்.",
    nutrientFocus: "எலக்ட்ரோலைட்டுகள் மற்றும் நார்ச்சத்து உணவு",
    trimester: 3,
  },
  36: {
    week: 36,
    stageName: "இறுதி தயாரிப்பு",
    stageEmoji: "💖",
    motherBody: "குழந்தை இடுப்புப் பகுதிக்கு இறங்கும். சுவாசம் எளிதாகும் ஆனால் அழுத்தம் கூடும்.",
    symptoms: ["இடுப்பு அழுத்தம்", "சுத்தம் செய்யும் ஆர்வம்", "கால் வீக்கம்"],
    weeklyTip: "மருத்துவமனை பையை தயார் செய்து வாராந்திர பரிசோதனைக்கு செல்லுங்கள்.",
    nutrientFocus: "புரதம் மற்றும் கார்போஹைட்ரேட்",
    trimester: 3,
  },
  40: {
    week: 40,
    stageName: "முழு நிறைவு மற்றும் பிரசவம்",
    stageEmoji: "🎉",
    motherBody: "உடல் பிரசவத்திற்கு முழுமையாக தயார் நிலையில் உள்ளது.",
    symptoms: ["வலுவான வலிகள்", "கீழ் முதுகு வலி", "சோர்வு"],
    weeklyTip: "நன்கு ஓய்வெடுங்கள் மற்றும் உண்மையான பிரசவ அறிகுறிகளைக் கவனியுங்கள்.",
    nutrientFocus: "எளிதில் செரிக்கும் உணவு மற்றும் நீர்",
    trimester: 3,
  },
};

const WEEKS_DATA_TE: Record<number, WeekMaternalInfo> = {
  1: {
    week: 1,
    stageName: "సన్నద్ధత & గర్భధారణ",
    stageEmoji: "🌱",
    motherBody: "గర్భాశయం గర్భధారణకు సిద్ధమవుతోంది. శరీరంలో హార్మోన్ల సమన్వయం మొదలవుతుంది.",
    symptoms: ["తేలికపాటి నొప్పి", "శరీర ఉష్ణోగ్రత పెరుగుదల", "భావోద్వేగ మార్పులు"],
    weeklyTip: "రోజూ 400-600 ఎంసిజి ఫోలిక్ యాసిడ్ తీసుకోవడం ప్రారంభించండి.",
    nutrientFocus: "ఫోలిక్ యాసిడ్ & నీటి శాతము",
    trimester: 1,
  },
  4: {
    week: 4,
    stageName: "ప్రారంభ దశ",
    stageEmoji: "🌸",
    motherBody: "HCG హార్మోన్ స్థాయి పెరుగుతుంది. రొమ్ములలో సున్నితత్వం మరియు అలసట రావచ్చు.",
    symptoms: ["రొమ్ముల నొప్పి", "అలసట", "తేలికపాటి కడుపునొప్పి"],
    weeklyTip: "వైద్యుడిని సంప్రదించండి మరియు వారి సలహా లేకుండా మందులు వాడకండి.",
    nutrientFocus: "ఫోలేట్ & విటమిన్ బి6",
    trimester: 1,
  },
  8: {
    week: 8,
    stageName: "హార్మోన్ల మార్పుల ఉధృతి",
    stageEmoji: "✨",
    motherBody: "గర్భానికి పోషణ కోసం రక్త పరిమాణం పెరుగుతుంది. మార్నింగ్ సిక్‌నెస్ సహజం.",
    symptoms: ["వికారం / వాంతులు", "ఆహారంపై అయిష్టత", "వాసన గ్రహణ శక్తి", "తరచూ మూత్రవిసర్జన"],
    weeklyTip: "మంచం పక్కన పొడి బిస్కెట్లు ఉంచుకోండి, అల్లం టీ లేదా నిమ్మరసం తాగండి.",
    nutrientFocus: "విటమిన్ బి6, ఐరన్ & ఎలక్ట్రోలైట్లు",
    trimester: 1,
  },
  12: {
    week: 12,
    stageName: "మొదటి త్రైమాసికం పూర్తి",
    stageEmoji: "🌷",
    motherBody: "గర్భాశయం పైకి ఎదుగుతుంది. ఉదయం వేళ వికారం తగ్గుముఖం పడుతుంది.",
    symptoms: ["శక్తి తిరిగి రావడం", "తేలికపాటి తలనొప్పి", "ముఖంలో కళ"],
    weeklyTip: "12 వారాల అల్ట్రాసౌండ్ మరియు డాక్టర్ తనిఖీ చేయించుకోండి.",
    nutrientFocus: "కాల్షియం, విటమిన్ డి & ఫైబర్",
    trimester: 1,
  },
  16: {
    week: 16,
    stageName: "రెండవ త్రైమాసికం కాంతి",
    stageEmoji: "☀️",
    motherBody: "కడుపు కొద్దిగా కనిపిస్తుంది. రక్తప్రసరణ మెరుగై ముఖంలో అందమైన కాంతి వస్తుంది.",
    symptoms: ["కడుపు పట్టేయడం", "ఆకలి పెరగడం", "సులభ శ్వాస"],
    weeklyTip: "సౌకర్యవంతమైన చెప్పులు వాడండి, తేలికపాటి నడక లేదా యోగా చేయండి.",
    nutrientFocus: "ఐరన్ & విటమిన్ సి",
    trimester: 2,
  },
  20: {
    week: 20,
    stageName: "సగం మైలురాయి",
    stageEmoji: "🌿",
    motherBody: "మీరు సగం ప్రయాణాన్ని చేరుకున్నారు! బిడ్డ మొదటి కదలికలను అనుభవించవచ్చు.",
    symptoms: ["కదలికల అనుభూతి", "ఛాతీలో మంట", "నడుము నొప్పి"],
    weeklyTip: "అనాటమీ స్కాన్ చేయించుకోండి మరియు ఎడమవైపు తిరిగి పడుకోవడం అలవాటు చేసుకోండి.",
    nutrientFocus: "ఒమేగా-3 డీహెచ్ఏ & కోలిన్",
    trimester: 2,
  },
  24: {
    week: 24,
    stageName: "చురుకైన దశ",
    stageEmoji: "🌺",
    motherBody: "కడుపు చర్మం సాగుతుంది. శరీర సమతుల్యత మారుతుంది.",
    symptoms: ["కడుపుపై దురద", "రాత్రి కాళ్ళ నొప్పులు", "పాదాల వాపు"],
    weeklyTip: "కడుపుపై మాయిశ్చరైజర్ రాయండి మరియు నిద్రపోయే ముందు పాదాల వ్యాయామం చేయండి.",
    nutrientFocus: "మెగ్నీషియం & పొటాషియం",
    trimester: 2,
  },
  28: {
    week: 28,
    stageName: "మూడవ త్రైమాసికం ప్రవేశం",
    stageEmoji: "🌼",
    motherBody: "చివరి దశకు స్వాగతం! కడుపు పెరిగేకొద్దీ శ్వాస తీసుకోవడం కష్టంగా ఉండవచ్చు.",
    symptoms: ["శ్వాస ఆడకపోవడం", "వెన్నునొప్పి", "కలలు"],
    weeklyTip: "27-36 వారాల మధ్య Tdap టీకా తీసుకోండి మరియు షుగర్ టెస్ట్ చేయించుకోండి.",
    nutrientFocus: "ఐరన్, ప్రోటీన్ & కాల్షియం",
    trimester: 3,
  },
  32: {
    week: 32,
    stageName: "పరిపక్వత దశ",
    stageEmoji: "🕊️",
    motherBody: "శరీరం డెలివరీకి సిద్ధమవుతోంది. బ్రాక్స్టన్ హిక్స్ సంకోచాలు రావచ్చు.",
    symptoms: ["సాధన నొప్పులు", "తరచూ మూత్రం", "నిద్రలేమి"],
    weeklyTip: "ప్రెగ్నెన్సీ పిల్లో ఉపయోగించండి మరియు తగినంత నీరు తాగండి.",
    nutrientFocus: "ఎలక్ట్రోలైట్లు & పీచు పదార్థాలు",
    trimester: 3,
  },
  36: {
    week: 36,
    stageName: "చివరి సన్నాహాలు",
    stageEmoji: "💖",
    motherBody: "శిశువు కటి ప్రాంతంలోకి దిగుతుంది. శ్వాస సులభమవుతుంది కానీ ఒత్తిడి పెరుగుతుంది.",
    symptoms: ["కటి భాగంలో ఒత్తిడి", "శుభ్రత ఉత్సాహం", "పాదాల వాపు"],
    weeklyTip: "హాస్పిటల్ బ్యాగ్ సిద్ధం చేసుకోండి మరియు వారపు పరీక్షలకు వెళ్ళండి.",
    nutrientFocus: "ప్రోటీన్ & కాంప్లెక్స్ కార్బోహైడ్రేట్లు",
    trimester: 3,
  },
  40: {
    week: 40,
    stageName: "పూర్తి వ్యవధి & ప్రసవ సన్నద్ధత",
    stageEmoji: "🎉",
    motherBody: "మీ శరీరం ప్రసవానికి పూర్తిగా సిద్ధంగా ఉంది.",
    symptoms: ["తీవ్రమైన నొప్పులు", "నడుము నొప్పి", "అలసట"],
    weeklyTip: "వీలైనంత విశ్రాంతి తీసుకోండి మరియు అసలైన ప్రసవ లక్షణాలను గమనించండి.",
    nutrientFocus: "సులభంగా జీర్ణమయ్యే ఆహారం & నీరు",
    trimester: 3,
  },
};

const MILESTONE_WEEKS = [1, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

const TUNES_BY_LANG: Record<SupportedLanguage, { title: string; desc: string; icon: string; id: string }[]> = {
  English: [
    { id: "1", title: "Brahms Lullaby", desc: "Classic soothing melody for maternal calmness", icon: "🎵" },
    { id: "2", title: "Gentle Ocean Waves", desc: "Calming white noise for restful sleep", icon: "🌊" },
    { id: "3", title: "Soft Piano Serenade", desc: "Tender acoustic harmony for emotional relaxation", icon: "🎹" },
    { id: "4", title: "Deep Breathing Soundscape", desc: "Meditative rhythms for prenatal stress relief", icon: "🍃" },
  ],
  Kannada: [
    { id: "1", title: "ಬ್ರಾಹ್ಮ್ಸ್ ಲಾಲಿಹಾಡು", desc: "ತಾಯಿಯ ಮನಸ್ಸಿನ ಶಾಂತಿಗಾಗಿ ಕ್ಲಾಸಿಕ್ ರಾಗ", icon: "🎵" },
    { id: "2", title: "ಶಾಂತ ಸಾಗರದ ಅಲೆಗಳು", desc: "ನೆಮ್ಮದಿಯ ನಿದ್ರೆಗಾಗಿ ಶಾಂತಿಯುತ ಶಬ್ದ", icon: "🌊" },
    { id: "3", title: "ಮೃದುವಾದ ಪಿಯಾನೋ ರಾಗ", desc: "ಭಾವನಾತ್ಮಕ ವಿಶ್ರಾಂತಿಗಾಗಿ ಮಧುರ ಸಂಗೀತ", icon: "🎹" },
    { id: "4", title: "ಆಳವಾದ ಉಸಿರಾಟದ ಧ್ಯಾನ", desc: "ಗರ್ಭಧಾರಣೆಯ ಒತ್ತಡ ನಿವಾರಣೆಗಾಗಿ ಧ್ಯಾನ", icon: "🍃" },
  ],
  Hindi: [
    { id: "1", title: "ब्राह्म्स लोरी", desc: "मातृ शांति के लिए सुखदायक धुन", icon: "🎵" },
    { id: "2", title: "शांत सागर की लहरें", desc: "आरामदायक नींद के लिए वाइट नॉइज़", icon: "🌊" },
    { id: "3", title: "कोमल पियानो धुन", desc: "भावनात्मक विश्राम के लिए मधुर संगीत", icon: "🎹" },
    { id: "4", title: "गहरी सांसों का ध्यान", desc: "तनाव से राहत देने वाला ध्यान संगीत", icon: "🍃" },
  ],
  Tamil: [
    { id: "1", title: "பிராம்ஸ் தாலாட்டு", desc: "தாயின் மன அமைதிக்கான இனிமையான இசை", icon: "🎵" },
    { id: "2", title: "மென்மையான கடல் அலைகள்", desc: "ஆழ்ந்த உறக்கத்திற்கான அமைதியான அலைகள்", icon: "🌊" },
    { id: "3", title: "மெல்லிய பியானோ இசை", desc: "உணர்ச்சி அமைதிக்கான இசை", icon: "🎹" },
    { id: "4", title: "ஆழமான மூச்சுப் பயிற்சி இசை", desc: "கர்ப்பகால மன அழுத்த நிவாரணம்", icon: "🍃" },
  ],
  Telugu: [
    { id: "1", title: "బ్రాహ్మ్స్ జోలపాట", desc: "తల్లి ప్రశాంతత కోసం శ్రావ్యమైన రాగం", icon: "🎵" },
    { id: "2", title: "శాంతమైన సముద్రపు అలలు", desc: "మంచి నిద్ర కోసం శబ్దాలు", icon: "🌊" },
    { id: "3", title: "మృదువైన పియానో రాగం", desc: "భావోద్వేగ ప్రశాంతత కోసం", icon: "🎹" },
    { id: "4", title: "లోతైన శ్వాస ధ్యాన సంగీతం", desc: "గర్భధారణ ఒత్తిడి నివారణ", icon: "🍃" },
  ],
};

const EXTRA_LABELS: Record<SupportedLanguage, { relaxationTitle: string; relaxationSub: string; logHealth: string; nutritionGuide: string }> = {
  English: {
    relaxationTitle: "Maternal Relaxation & Peace",
    relaxationSub: "Gentle acoustic sounds for your daily rest",
    logHealth: "Log Health Record",
    nutritionGuide: "Nutrition Guide",
  },
  Kannada: {
    relaxationTitle: "ತಾಯಿಯ ವಿಶ್ರಾಂತಿ ಮತ್ತು ನೆಮ್ಮದಿ",
    relaxationSub: "ದೈನಂದಿನ ವಿಶ್ರಾಂತಿಗಾಗಿ ಮೃದುವಾದ ಶಬ್ದಗಳು",
    logHealth: "ಆರೋಗ್ಯ ದಾಖಲೆ ಸೇರಿಸಿ",
    nutritionGuide: "ಪೋಷಣಾ ಮಾರ್ಗದರ್ಶಿ",
  },
  Hindi: {
    relaxationTitle: "मातृ विश्राम और शांति",
    relaxationSub: "दैनिक आराम के लिए सुखदायक ध्वनियां",
    logHealth: "स्वास्थ्य रिकॉर्ड जोड़ें",
    nutritionGuide: "पोषण मार्गदर्शिका",
  },
  Tamil: {
    relaxationTitle: "தாயின் அமைதி மற்றும் ஓய்வு",
    relaxationSub: "தினசரி ஓய்வுக்கான மென்மையான ஒலிகள்",
    logHealth: "சுகாதார பதிவு சேர்க்கவும்",
    nutritionGuide: "ஊட்டச்சத்து வழிகாட்டி",
  },
  Telugu: {
    relaxationTitle: "తల్లి విశ్రాంతి & ప్రశాంతత",
    relaxationSub: "రోజువారీ విశ్రాంతి కోసం ఆహ్లాదకరమైన శబ్దాలు",
    logHealth: "ఆరోగ్య రికార్డు నమోదు",
    nutritionGuide: "పోషకాహార మార్గదర్శి",
  },
};

export default function PregnancyScreen() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
          const res = await getPregnancyProfile(token);
          if (res.success && res.profile?.pregnancyWeek) {
            const w = res.profile.pregnancyWeek;
            const closest = MILESTONE_WEEKS.reduce((prev, curr) =>
              Math.abs(curr - w) < Math.abs(prev - w) ? curr : prev
            );
            setSelectedWeek(closest);
          }
        }
      } catch (err) {
        console.log("Could not load user pregnancy week:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getWeekInfo = (wk: number): WeekMaternalInfo => {
    let dataset = WEEKS_DATA_EN;
    if (language === "Kannada") dataset = WEEKS_DATA_KN;
    else if (language === "Hindi") dataset = WEEKS_DATA_HI;
    else if (language === "Tamil") dataset = WEEKS_DATA_TA;
    else if (language === "Telugu") dataset = WEEKS_DATA_TE;

    return dataset[wk] || dataset[12] || WEEKS_DATA_EN[12];
  };

  const currentInfo = getWeekInfo(selectedWeek);
  const tunes = TUNES_BY_LANG[language] || TUNES_BY_LANG.English;
  const extra = EXTRA_LABELS[language] || EXTRA_LABELS.English;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.pregnancy} 🌸</Text>
            <Text style={styles.headerSubtitle}>{t.pregnancyGuideSubtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Week Selector Chips */}
        <Text style={styles.selectorLabel}>{t.selectWeek.toUpperCase()}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {MILESTONE_WEEKS.map((w) => {
            const isSelected = w === selectedWeek;
            return (
              <TouchableOpacity
                key={w}
                style={[styles.weekChip, isSelected && styles.weekChipActive]}
                onPress={() => setSelectedWeek(w)}
              >
                <Text style={[styles.weekChipText, isSelected && styles.weekChipTextActive]}>
                  {t.currentWeek} {w}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color="#B86D84" style={{ marginVertical: 35 }} />
        ) : (
          <>
            {/* Hero Card for Mother's Journey */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroEmojiCircle}>
                  <Text style={styles.heroEmoji}>{currentInfo.stageEmoji}</Text>
                </View>
                <View style={styles.heroDetails}>
                  <View style={styles.trimesterBadge}>
                    <Text style={styles.trimesterBadgeText}>
                      {t.trimester} {currentInfo.trimester}
                    </Text>
                  </View>
                  <Text style={styles.heroTitle}>{t.currentWeek} {currentInfo.week}</Text>
                  <Text style={styles.heroStage}>{currentInfo.stageName}</Text>
                </View>
              </View>

              <View style={styles.focusRow}>
                <Text style={styles.focusLabel}>🎯 {t.nutrientFocus}:</Text>
                <Text style={styles.focusValue}>{currentInfo.nutrientFocus}</Text>
              </View>
            </View>

            {/* Mother's Body Changes Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>🤰</Text>
                <Text style={styles.cardHeaderTitle}>{t.yourBodyThisWeek}</Text>
              </View>
              <Text style={styles.cardBody}>{currentInfo.motherBody}</Text>
            </View>

            {/* Common Symptoms to Expect */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>📋</Text>
                <Text style={styles.cardHeaderTitle}>{t.commonSymptoms}</Text>
              </View>
              <View style={styles.symptomsList}>
                {currentInfo.symptoms.map((symp, i) => (
                  <View key={i} style={styles.symptomRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.symptomText}>{symp}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Weekly Doctor / Care Suggestion */}
            <View style={styles.tipCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>💡</Text>
                <Text style={styles.tipCardTitle}>{t.weeklyWellnessTip}</Text>
              </View>
              <Text style={styles.tipCardBody}>{currentInfo.weeklyTip}</Text>
            </View>

            {/* Relaxing Tunes / Prenatal Wellness */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{extra.relaxationTitle}</Text>
              <Text style={styles.sectionSub}>{extra.relaxationSub}</Text>
            </View>

            {tunes.map((tune) => (
              <View key={tune.id} style={styles.tuneCard}>
                <Text style={styles.tuneIcon}>{tune.icon}</Text>
                <View style={styles.tuneContent}>
                  <Text style={styles.tuneTitle}>{tune.title}</Text>
                  <Text style={styles.tuneDesc}>{tune.desc}</Text>
                </View>
              </View>
            ))}

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/nutrition")}
              >
                <Text style={styles.actionIcon}>🥗</Text>
                <Text style={styles.actionText}>{extra.nutritionGuide}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/health")}
              >
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={styles.actionText}>{extra.logHealth}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8FA" },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCECEF",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 28, color: "#9E566C", marginTop: -4 },
  headerCenter: { alignItems: "center", flex: 1, paddingHorizontal: 8 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#593341", textAlign: "center" },
  headerSubtitle: { fontSize: 11, color: "#947682", marginTop: 2, textAlign: "center" },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#FCE8EF",
    borderWidth: 1,
    borderColor: "#EFA9BC",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94455E",
  },

  selectorLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#B86D84",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  chipsScroll: { paddingBottom: 15, gap: 8 },
  weekChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4D9E2",
    alignItems: "center",
    justifyContent: "center",
  },
  weekChipActive: { backgroundColor: "#B86D84", borderColor: "#B86D84" },
  weekChipText: { fontSize: 12, fontWeight: "800", color: "#7B5060" },
  weekChipTextActive: { color: "#FFFFFF" },

  heroCard: {
    backgroundColor: "#FFEAF0",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F7D1DC",
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroEmojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    elevation: 2,
    shadowColor: "#B86D84",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroEmoji: { fontSize: 32 },
  heroDetails: { flex: 1 },
  trimesterBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FCD3DE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  trimesterBadgeText: { fontSize: 10, fontWeight: "800", color: "#8E4158" },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#542D3C" },
  heroStage: { fontSize: 14, color: "#8C586B", fontWeight: "700", marginTop: 2 },

  focusRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  focusLabel: { fontSize: 11, fontWeight: "800", color: "#9E6D7E", marginRight: 6 },
  focusValue: { fontSize: 12, fontWeight: "900", color: "#542D3C" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F7E6EC",
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardHeaderIcon: { fontSize: 20, marginRight: 8 },
  cardHeaderTitle: { fontSize: 15, fontWeight: "900", color: "#542D3C" },
  cardBody: { fontSize: 13, lineHeight: 21, color: "#6F5761" },

  symptomsList: { gap: 6, marginTop: 4 },
  symptomRow: { flexDirection: "row", alignItems: "flex-start" },
  bulletDot: { fontSize: 16, color: "#B86D84", marginRight: 8, lineHeight: 20 },
  symptomText: { fontSize: 13, color: "#6F5761", flex: 1, lineHeight: 20 },

  tipCard: {
    backgroundColor: "#FFF4E8",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FCE4CC",
  },
  tipCardTitle: { fontSize: 15, fontWeight: "900", color: "#784C21" },
  tipCardBody: { fontSize: 13, lineHeight: 20, color: "#755639" },

  sectionHeader: { marginTop: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "900", color: "#542D3C" },
  sectionSub: { fontSize: 12, color: "#947682", marginTop: 2 },

  tuneCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7E6EC",
  },
  tuneIcon: { fontSize: 24, marginRight: 14 },
  tuneContent: { flex: 1 },
  tuneTitle: { fontSize: 14, fontWeight: "800", color: "#542D3C" },
  tuneDesc: { fontSize: 11, color: "#8A6D79", marginTop: 2 },

  actionsRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F4D9E2",
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionText: { fontSize: 12, fontWeight: "800", color: "#7B5060" },
});
