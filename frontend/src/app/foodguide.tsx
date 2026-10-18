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
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type FoodCategory = {
  name: string;
  icon: string;
  description: string;
  foods: string;
};

const FOOD_CATEGORIES_BY_LANG: Record<SupportedLanguage, FoodCategory[]> = {
  English: [
    {
      name: "Fruits",
      icon: "🍎",
      description: "Fresh fruits provide vitamins, minerals and natural fibre.",
      foods: "Apple, banana, orange, guava, papaya",
    },
    {
      name: "Vegetables",
      icon: "🥦",
      description: "Vegetables provide important vitamins, minerals and fibre.",
      foods: "Spinach, carrot, beans, broccoli, tomato",
    },
    {
      name: "Whole Grains",
      icon: "🌾",
      description: "Whole grains provide energy and dietary fibre.",
      foods: "Oats, brown rice, whole wheat, ragi",
    },
    {
      name: "Protein Foods",
      icon: "🥚",
      description: "Protein supports the growth and repair of body tissues.",
      foods: "Eggs, lentils, beans, paneer, nuts",
    },
    {
      name: "Dairy",
      icon: "🥛",
      description: "Dairy foods provide calcium, probiotics and protein.",
      foods: "Milk, curd, paneer, yoghurt",
    },
    {
      name: "Healthy Fats",
      icon: "🥑",
      description: "Healthy fats are an important part of a balanced diet.",
      foods: "Avocado, walnuts, chia seeds, flax seeds",
    },
  ],
  Kannada: [
    {
      name: "ತಾಜಾ ಹಣ್ಣುಗಳು",
      icon: "🍎",
      description: "ತಾಜಾ ಹಣ್ಣುಗಳು ವಿಟಮಿನ್‌ಗಳು, ಖನಿಜಗಳು ಮತ್ತು ನೈಸರ್ಗಿಕ ನಾರಿನಂಶವನ್ನು ಒದಗಿಸುತ್ತವೆ.",
      foods: "ಸೇಬು, ಬಾಳೆಹಣ್ಣು, ಕಿತ್ತಳೆ, ಸೀಬೆಹಣ್ಣು, ಪರಂಗಿಹಣ್ಣು",
    },
    {
      name: "ಹಸಿರು ತರಕಾರಿಗಳು",
      icon: "🥦",
      description: "ತರಕಾರಿಗಳು ಪ್ರಮುಖ ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ಜೀರ್ಣಕ್ರಿಯೆಗೆ ನಾರಿನಂಶ ನೀಡುತ್ತವೆ.",
      foods: "ಪಾಲಕ್, ಕ್ಯಾರೆಟ್, ಬೀನ್ಸ್, ಹೂಕೋಸು, ಟೊಮೇಟೊ",
    },
    {
      name: "ಧಾನ್ಯಗಳು & ರಾಗಿ",
      icon: "🌾",
      description: "ಧಾನ್ಯಗಳು ನಿರಂತರ ಶಕ್ತಿ ಮತ್ತು ಅಗತ್ಯ ನಾರಿನಂಶ ನೀಡುತ್ತವೆ.",
      foods: "ರಾಗಿ, ಓಟ್ಸ್, ಕುಚಲಕ್ಕಿ, ಗೋಧಿ",
    },
    {
      name: "ಪ್ರೋಟೀನ್ ಭರಿತ ಆಹಾರ",
      icon: "🥚",
      description: "ಪ್ರೋಟೀನ್ ದೇಹದ ಅಂಗಾಂಶಗಳ ಬೆಳವಣಿಗೆ ಮತ್ತು ಮಗುವಿನ ಬೆಳವಣಿಗೆಗೆ ಸಹಕಾರಿ.",
      foods: "ಮೊಟ್ಟೆ, ಬೇಳೆಕಾಳುಗಳು, ಪನೀರ್, ಕಡಲೆ, ಬೀಜಗಳು",
    },
    {
      name: "ಹಾಲು ಮತ್ತು ಹಾಲಿನ ಉತ್ಪನ್ನಗಳು",
      icon: "🥛",
      description: "ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಮೂಳೆಗಳ ಬಲವರ್ಧನೆಗೆ ಹಾಲು, ಮೊಸರು ಅತ್ಯಗತ್ಯ.",
      foods: "ಹಾಲು, ಮೊಸರು, ಮಜ್ಜಿಗೆ, ಪನೀರ್",
    },
    {
      name: "ಆರೋಗ್ಯಕರ ಕೊಬ್ಬುಗಳು",
      icon: "🥑",
      description: "ಮಗುವಿನ ಮಿದುಳಿನ ಬೆಳವಣಿಗೆಗೆ ಅಗತ್ಯವಾದ ಒಮೆಗಾ ಕೊಬ್ಬಿನಾಮ್ಲಗಳು.",
      foods: "ಅಕ್ರೋಟು (ವಾಲ್ನಟ್), ಬಾದಾಮಿ, ಅಗಸೆ ಬೀಜಗಳು",
    },
  ],
  Hindi: [
    {
      name: "ताजे फल",
      icon: "🍎",
      description: "ताजे फल विटामिन, खनिज और प्राकृतिक फाइबर प्रदान करते हैं।",
      foods: "सेब, केला, संतरा, अमरूद, पपीता",
    },
    {
      name: "हरी सब्जियां",
      icon: "🥦",
      description: "सब्जियां आवश्यक विटामिन, खनिज और फाइबर से भरपूर होती हैं।",
      foods: "पालक, गाजर, बीन्स, ब्रोकली, टमाटर",
    },
    {
      name: "साबुत अनाज",
      icon: "🌾",
      description: "साबुत अनाज ऊर्जा और पाचन के लिए आहार फाइबर प्रदान करते हैं।",
      foods: "ओट्स, भूरे चावल, गेहूं, रागी",
    },
    {
      name: "प्रोटीन युक्त आहार",
      icon: "🥚",
      description: "प्रोटीन शरीर के ऊतकों और बच्चे के विकास में मदद करता है।",
      foods: "अंडे, दालें, पनीर, सोया, मेवे",
    },
    {
      name: "डेयरी उत्पाद",
      icon: "🥛",
      description: "डेयरी खाद्य पदार्थ कैल्शियम और प्रोटीन प्रदान करते हैं।",
      foods: "दूध, दही, पनीर, छाछ",
    },
    {
      name: "स्वस्थ वसा",
      icon: "🥑",
      description: "स्वस्थ वसा संतुलित आहार और बच्चे के मस्तिष्क विकास का अहम हिस्सा हैं।",
      foods: "अखरोट, बादाम, चिया बीज, अलसी",
    },
  ],
  Tamil: [
    {
      name: "புதிய பழங்கள்",
      icon: "🍎",
      description: "பழங்கள் வைட்டமின்கள், தாதுக்கள் மற்றும் நார்ச்சத்து அளிக்கின்றன.",
      foods: "ஆப்பிள், வாழைப்பழம், ஆரஞ்சு, கொய்யா, பப்பாளி",
    },
    {
      name: "பச்சை காய்கறிகள்",
      icon: "🥦",
      description: "காய்கறிகள் உடலுக்குத் தேவையான ஊட்டச்சத்துக்களையும் நார்ச்சத்தையும் தருகின்றன.",
      foods: "கீரை, கேரட், பீன்ஸ், ப்ரோக்கோலி, தக்காளி",
    },
    {
      name: "முழு தானியங்கள்",
      icon: "🌾",
      description: "தானியங்கள் ஆற்றலையும் செரிமான நார்ச்சத்தையும் வழங்குகின்றன.",
      foods: "கேழ்வரகு (ராகி), ஓட்ஸ், பழுப்பு அரிசி, கோதுமை",
    },
    {
      name: "புரத உணவுகள்",
      icon: "🥚",
      description: "புரதம் திசுக்களின் வளர்ச்சிக்கும் குழந்தையின் ஆரோக்கியத்திற்கும் முக்கியமானது.",
      foods: "முட்டை, பருப்பு வகைகள், பன்னீர், சுண்டல், நட்ஸ்",
    },
    {
      name: "பால் பொருட்கள்",
      icon: "🥛",
      description: "கால்சியம் மற்றும் எலும்பு வலிமைக்கு பால் மற்றும் தயிர் நல்லது.",
      foods: "பால், தயிர், மோர், பன்னீர்",
    },
    {
      name: "ஆரோக்கியமான கொழுப்புகள்",
      icon: "🥑",
      description: "குழந்தையின் மூளை வளர்ச்சிக்கு தேவையான ஒமேகா சத்துக்கள்.",
      foods: "அக்ரூட் பருப்பு, பாதாம், ஆளி விதைகள்",
    },
  ],
  Telugu: [
    {
      name: "తాజా పండ్లు",
      icon: "🍎",
      description: "పండ్లు విటమిన్లు, ఖనిజాలు మరియు సహజ పీచు పదార్థాలను అందిస్తాయి.",
      foods: "యాపిల్, అరటి, నారింజ, జామ, బొప్పాయి",
    },
    {
      name: "ఆకుకూరలు & కూరగాయలు",
      icon: "🥦",
      description: "కూరగాయలు ముఖ్యమైన విటమిన్లు, ఖనిజాలు మరియు ఫైబర్‌ను అందిస్తాయి.",
      foods: "పాలకూర, క్యారెట్, బీన్స్, బ్రోకలీ, టమోటా",
    },
    {
      name: "తృణధాన్యాలు & రాగులు",
      icon: "🌾",
      description: "తృణధాన్యాలు శక్తిని మరియు జీర్ణక్రియకు ఫైబర్‌ను అందిస్తాయి.",
      foods: "రాగులు, ఓట్స్, బ్రౌన్ రైస్, గోధుమలు",
    },
    {
      name: "ప్రోటీన్ సమృద్ధి ఆహారాలు",
      icon: "🥚",
      description: "కణజాలాల అభివృద్ధి మరియు శిశువు పెరుగుదలకు ప్రొటీన్ కీలకం.",
      foods: "గుడ్లు, పప్పుధాన్యాలు, పనీర్, గింజలు",
    },
    {
      name: "పాల ఉత్పత్తులు",
      icon: "🥛",
      description: "కాల్షియం మరియు ఎముకల బలానికి పాలు, పెరుగు ఎంతో అవసరం.",
      foods: "పాలు, పెరుగు, మజ్జిగ, పనీర్",
    },
    {
      name: "ఆరోగ్యకర కొవ్వులు",
      icon: "🥑",
      description: "శిశువు మెదడు అభివృద్ధికి అవసరమైన ఒమేగా కొవ్వు ఆమ్లాలు.",
      foods: "వాల్‌నట్స్, బాదం, అవిసె గింజలు",
    },
  ],
};

export default function FoodGuide() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const categories = FOOD_CATEGORIES_BY_LANG[language] || FOOD_CATEGORIES_BY_LANG.English;

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
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t.foodGuideTitle}</Text>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🍎</Text>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              {t.foodguide}
            </Text>

            <Text style={styles.introText}>
              {t.foodGuideSubtitle}
            </Text>
          </View>
        </View>

        {/* Food Categories */}
        <Text style={styles.sectionTitle}>{t.recommendedGroups}</Text>

        {categories.map((category) => (
          <View style={styles.foodCard} key={category.name}>
            <View style={styles.iconContainer}>
              <Text style={styles.foodIcon}>{category.icon}</Text>
            </View>

            <View style={styles.foodContent}>
              <Text style={styles.foodName}>{category.name}</Text>

              <Text style={styles.description}>
                {category.description}
              </Text>

              <Text style={styles.sourcesLabel}>Examples / ಆಹಾರಗಳು</Text>

              <Text style={styles.sources}>{category.foods}</Text>
            </View>
          </View>
        ))}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💗</Text>

          <Text style={styles.tipTitle}>{t.appName} Tip</Text>

          <Text style={styles.tipText}>
            {t.weeklyGuidanceDesc}
          </Text>
        </View>

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
    backgroundColor: "#FFF9F7",
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
    backgroundColor: "#FCEEEA",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 32,
    color: "#8B5345",
    lineHeight: 34,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#543027",
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#FCEEEA",
    borderWidth: 1,
    borderColor: "#F0B9AC",
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8B5345",
  },
  introCard: {
    backgroundColor: "#FFF2EE",
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
    color: "#543027",
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: "#856056",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#543027",
    marginBottom: 14,
  },
  foodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF2EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  foodIcon: {
    fontSize: 24,
  },
  foodContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#543027",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#7E5C53",
    lineHeight: 18,
    marginBottom: 8,
  },
  sourcesLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A26C5F",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  sources: {
    fontSize: 13,
    color: "#4A2820",
    fontWeight: "600",
  },
  tipCard: {
    backgroundColor: "#FFF4ED",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  tipEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6E3E33",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#835C52",
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 12,
    color: "#9C7970",
    lineHeight: 17,
    textAlign: "center",
  },
});