import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "../utils/storage";

import {
  getPregnancyProfile,
  getChildProfile,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

export default function ModeSelection() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<
    "pregnancy" | "child" | null
  >(null);

  const [loading, setLoading] = useState(false);

  const continueToApp = async () => {
    if (!selectedMode) {
      Alert.alert(
        t.chooseYourMode,
        t.selectJourneyDesc
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        await SecureStore.getItemAsync("authToken");

      const storedUser =
        await SecureStore.getItemAsync("user");

      if (!token) {
        router.replace("/");
        return;
      }

      let user = storedUser
        ? JSON.parse(storedUser)
        : {};

      /*
       * Check whether a profile already exists
       * for the selected mode.
       */

      let profileExists = false;

      if (selectedMode === "pregnancy") {
        const result =
          await getPregnancyProfile(token);

        profileExists =
          result.success &&
          !!result.profile;
      }

      if (selectedMode === "child") {
        const result =
          await getChildProfile(token);

        profileExists =
          result.success &&
          !!result.profile;
      }

      /*
       * Store the selected mode locally.
       * This allows the dashboard to know
       * which mode is currently active.
       */

      user.mode = selectedMode;

      await SecureStore.setItemAsync(
        "user",
        JSON.stringify(user)
      );

      /*
       * If profile already exists,
       * directly open dashboard.
       */

      if (profileExists) {
        router.replace("/dashboard");
        return;
      }

      /*
       * If profile does not exist,
       * ask the user to create it.
       */

      if (selectedMode === "pregnancy") {
        router.push("/pregnancy-profile");
      } else {
        router.push("/child-profile");
      }
    } catch (error) {
      console.log(
        "Mode selection error:",
        error
      );

      Alert.alert(
        t.error,
        "We could not check your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* TOP BAR WITH BACK & LANGUAGE TOGGLE */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backText}>
              ‹ {t.back}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.logo}>
            🌸
          </Text>

          <Text style={styles.title}>
            {t.chooseYourMode}
          </Text>

          <Text style={styles.subtitle}>
            {t.selectJourneyDesc}
          </Text>
        </View>

        {/* PREGNANCY */}

        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === "pregnancy" &&
              styles.selectedPregnancy,
          ]}
          onPress={() =>
            setSelectedMode("pregnancy")
          }
          activeOpacity={0.85}
          disabled={loading}
        >
          <View style={styles.iconCirclePink}>
            <Text style={styles.modeEmoji}>
              🤰
            </Text>
          </View>

          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>
              {t.pregnancyMode}
            </Text>

            <Text style={styles.modeDescription}>
              {t.pregnancyModeDesc}
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedMode === "pregnancy" &&
                styles.radioSelected,
            ]}
          >
            {selectedMode ===
              "pregnancy" && (
              <View style={styles.radioDot} />
            )}
          </View>
        </TouchableOpacity>

        {/* CHILD */}

        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === "child" &&
              styles.selectedChild,
          ]}
          onPress={() =>
            setSelectedMode("child")
          }
          activeOpacity={0.85}
          disabled={loading}
        >
          <View style={styles.iconCircleMint}>
            <Text style={styles.modeEmoji}>
              👶
            </Text>
          </View>

          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>
              {t.childMode}
            </Text>

            <Text style={styles.modeDescription}>
              {t.childModeDesc}
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedMode === "child" &&
                styles.radioSelected,
            ]}
          >
            {selectedMode === "child" && (
              <View style={styles.radioDot} />
            )}
          </View>
        </TouchableOpacity>

        {/* CONTINUE */}

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedMode || loading) &&
              styles.disabledButton,
          ]}
          onPress={continueToApp}
          disabled={!selectedMode || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.continueText}>
              {t.continueBtn}
            </Text>
          )}
        </TouchableOpacity>

        {/* INFO */}

        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>
            💗
          </Text>

          <Text style={styles.infoText}>
            {t.tagline}
          </Text>
        </View>

        <LanguageSelectorModal
          visible={showLangModal}
          onClose={() => setShowLangModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },

  content: {
    flex: 1,
    padding: 22,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9A6175",
  },

  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FCE8EF",
    borderWidth: 1,
    borderColor: "#EFA9BC",
  },

  langPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94455E",
  },

  header: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 28,
  },

  logo: {
    fontSize: 42,
    marginBottom: 8,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#54313D",
  },

  subtitle: {
    fontSize: 13,
    color: "#8E707A",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 310,
  },

  modeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },

  selectedPregnancy: {
    borderColor: "#E8A9BB",
    backgroundColor: "#FFF5F8",
  },

  selectedChild: {
    borderColor: "#A9D8C5",
    backgroundColor: "#F3FCF8",
  },

  iconCirclePink: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F9E0E8",
    justifyContent: "center",
    alignItems: "center",
  },

  iconCircleMint: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#DDF3EA",
    justifyContent: "center",
    alignItems: "center",
  },

  modeEmoji: {
    fontSize: 29,
  },

  modeInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },

  modeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#54313D",
  },

  modeDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: "#8B717A",
    marginTop: 5,
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D5B8C2",
    justifyContent: "center",
    alignItems: "center",
  },

  radioSelected: {
    borderColor: "#B86D84",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#B86D84",
  },

  continueButton: {
    backgroundColor: "#B86D84",
    borderRadius: 18,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  infoCard: {
    backgroundColor: "#F7EAF0",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },

  infoEmoji: {
    fontSize: 22,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#765C67",
  },
});