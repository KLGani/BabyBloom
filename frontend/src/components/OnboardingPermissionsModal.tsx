import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SupportedLanguage, TRANSLATIONS } from "../i18n/translations";
import { AVAILABLE_LANGUAGES, useLanguage } from "../context/LanguageContext";

interface OnboardingPermissionsModalProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingPermissionsModal: React.FC<OnboardingPermissionsModalProps> = ({
  visible,
  onComplete,
}) => {
  const { language, setLanguage, completeOnboarding } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(language);
  const [notificationStatus, setNotificationStatus] = useState<"pending" | "granted">("pending");
  const [loading, setLoading] = useState(false);

  // Get active translations based on selected language
  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.English;

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    await setLanguage(lang);
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && "Notification" in window) {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            setNotificationStatus("granted");
            return;
          }
        }
        setNotificationStatus("granted");
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (status === "granted") {
        setNotificationStatus("granted");
      } else {
        setNotificationStatus("granted");
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
      setNotificationStatus("granted");
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding(selectedLang);
      onComplete();
    } catch (err) {
      console.error("Onboarding completion error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🌸</Text>
            </View>
            <Text style={styles.title}>{t.onboardingWelcome}</Text>
            <Text style={styles.subtitle}>{t.onboardingSubtitle}</Text>
          </View>

          {/* Section 1: Language Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionBadge}>1</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{t.selectLanguageTitle}</Text>
                <Text style={styles.cardDesc}>{t.selectLanguageDesc}</Text>
              </View>
            </View>

            <View style={styles.languageGrid}>
              {AVAILABLE_LANGUAGES.map((item) => {
                const isSelected = selectedLang === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.langPill,
                      isSelected && styles.langPillActive,
                    ]}
                    onPress={() => handleSelectLanguage(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.langNativeText,
                        isSelected && styles.langNativeTextActive,
                      ]}
                    >
                      {item.nativeLabel}
                    </Text>
                    <Text
                      style={[
                        styles.langSubText,
                        isSelected && styles.langSubTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 2: Notification Permission */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionBadge}>2</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  {t.permissionNotificationsTitle}
                </Text>
                <Text style={styles.cardDesc}>
                  {t.permissionNotificationsDesc}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.permissionBtn,
                notificationStatus === "granted" && styles.permissionBtnGranted,
              ]}
              onPress={requestNotificationPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionBtnIcon}>
                {notificationStatus === "granted" ? "✅" : "🔔"}
              </Text>
              <Text
                style={[
                  styles.permissionBtnText,
                  notificationStatus === "granted" && styles.permissionBtnTextGranted,
                ]}
              >
                {notificationStatus === "granted" ? t.allowedBtn : t.allowBtn}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Finish Button */}
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleFinish}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.finishBtnText}>{t.getStartedBtn}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F9DCE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#54313D",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#8B6B75",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardSectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#C47A91",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "800",
    fontSize: 12,
    marginRight: 10,
    marginTop: 2,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#54313D",
  },
  cardDesc: {
    fontSize: 12,
    color: "#8B6B75",
    marginTop: 3,
    lineHeight: 17,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  langPill: {
    width: "48%",
    backgroundColor: "#FAF4F6",
    borderWidth: 1.5,
    borderColor: "#EAD2DA",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  langPillActive: {
    backgroundColor: "#FFF0F4",
    borderColor: "#C47A91",
    borderWidth: 2,
  },
  langIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  langNativeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#54313D",
  },
  langNativeTextActive: {
    color: "#C47A91",
  },
  langSubText: {
    fontSize: 11,
    color: "#997380",
    marginTop: 2,
  },
  langSubTextActive: {
    color: "#C47A91",
    fontWeight: "600",
  },
  permissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C47A91",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  permissionBtnGranted: {
    backgroundColor: "#E2F4EB",
    borderWidth: 1,
    borderColor: "#58A375",
  },
  permissionBtnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  permissionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  permissionBtnTextGranted: {
    color: "#2C754A",
  },
  finishBtn: {
    backgroundColor: "#C47A91",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#C47A91",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
