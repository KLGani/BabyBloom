import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { createPregnancyProfile } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

export default function PregnancyProfileScreen() {
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [prePregnancyWeight, setPrePregnancyWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!pregnancyWeek.trim()) {
      Alert.alert(t.error, "Please enter your pregnancy week.");
      return;
    }

    const week = Number(pregnancyWeek);

    if (isNaN(week) || week < 1 || week > 42) {
      Alert.alert(t.error, t.weekRangeNote);
      return;
    }

    if (dueDate.trim()) {
      const match = dueDate.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

      if (!match) {
        Alert.alert(t.error, "Please enter the due date in DD/MM/YYYY format.");
        return;
      }

      const [, day, month, year] = match;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

      if (
        parsedDate.getFullYear() !== Number(year) ||
        parsedDate.getMonth() !== Number(month) - 1 ||
        parsedDate.getDate() !== Number(day)
      ) {
        Alert.alert(t.error, "Please enter a valid calendar date.");
        return;
      }
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert(t.error, "Please sign in again.", [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]);
        return;
      }

      const profileData = {
        pregnancyWeek: week,
        dueDate: dueDate.trim()
          ? (() => {
              const [day, month, year] = dueDate.trim().split("/");
              return `${year}-${month}-${day}`;
            })()
          : null,
        bloodGroup: bloodGroup.trim(),
        height: height ? Number(height) : null,
        prePregnancyWeight: prePregnancyWeight ? Number(prePregnancyWeight) : null,
        currentWeight: currentWeight ? Number(currentWeight) : null,
        notes: notes.trim(),
      };

      const result = await createPregnancyProfile(token, profileData);

      if (result.success) {
        Alert.alert(
          t.success + " 🌸",
          "Your pregnancy profile has been saved successfully.",
          [
            {
              text: t.continueBtn,
              onPress: () => router.replace("/dashboard"),
            },
          ]
        );
      } else {
        Alert.alert(t.error, result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Pregnancy profile error:", error);
      Alert.alert(t.error, "Something went wrong while saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.smallTitle}>{t.appName.toUpperCase()}</Text>
            <Text style={styles.title}>{t.pregnancyProfile}</Text>
          </View>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>🌷</Text>
          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>{t.pregnancyProfileSubtitle}</Text>
            <Text style={styles.introText}>{t.pregnancyProfileDesc}</Text>
          </View>
        </View>

        {/* Pregnancy Information */}
        <Text style={styles.sectionTitle}>{t.pregnancyInformation}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t.currentPregnancyWeek} *</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 20"
            placeholderTextColor="#B9A4AA"
            keyboardType="numeric"
            value={pregnancyWeek}
            onChangeText={setPregnancyWeek}
            maxLength={2}
          />
          <Text style={styles.helperText}>{t.weekRangeNote}</Text>

          <Text style={styles.label}>{t.expectedDueDate}</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#B9A4AA"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <Text style={styles.helperText}>Example: 15/02/2027</Text>
        </View>

        {/* Health Information */}
        <Text style={styles.sectionTitle}>{t.healthInformation}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t.bloodGroup}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: O+"
            placeholderTextColor="#B9A4AA"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
            maxLength={4}
          />

          <Text style={styles.label}>{t.height}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 160"
            placeholderTextColor="#B9A4AA"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.label}>{t.prePregnancyWeight}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 55"
            placeholderTextColor="#B9A4AA"
            keyboardType="decimal-pad"
            value={prePregnancyWeight}
            onChangeText={setPrePregnancyWeight}
          />

          <Text style={styles.label}>{t.currentWeight}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 61"
            placeholderTextColor="#B9A4AA"
            keyboardType="decimal-pad"
            value={currentWeight}
            onChangeText={setCurrentWeight}
          />
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>{t.additionalNotes}</Text>

        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder={t.pregnancyNotesPlaceholder}
            placeholderTextColor="#B9A4AA"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Privacy note */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>{t.privacyNotice}</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>{t.savePregnancyProfile}</Text>
              <Text style={styles.saveButtonArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.bottomText}>{t.updateLaterNote}</Text>

        <LanguageSelectorModal
          visible={showLangModal}
          onClose={() => setShowLangModal(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F8",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8E4EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backText: {
    fontSize: 32,
    color: "#9B6072",
    lineHeight: 34,
    marginTop: -3,
  },
  headerInfo: {
    flex: 1,
  },
  smallTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#C47A91",
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#49343B",
  },
  langPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAD4DC",
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9B6072",
  },
  introCard: {
    flexDirection: "row",
    backgroundColor: "#FCECEF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    alignItems: "center",
  },
  introEmoji: {
    fontSize: 38,
    marginRight: 14,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#633E4B",
    marginBottom: 5,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#805F69",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#49343B",
    marginBottom: 10,
    marginLeft: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    shadowColor: "#A96E80",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#624B53",
    marginBottom: 7,
    marginTop: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E9D5DB",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#49343B",
    backgroundColor: "#FFFBFC",
    marginBottom: 6,
  },
  notesInput: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },
  helperText: {
    fontSize: 11,
    color: "#A68D95",
    marginBottom: 12,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F1F3",
    borderRadius: 15,
    padding: 14,
    marginBottom: 22,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#806F75",
  },
  saveButton: {
    height: 55,
    backgroundColor: "#C47A91",
    borderRadius: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A95D76",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  saveButtonArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
  },
  bottomText: {
    textAlign: "center",
    fontSize: 11,
    color: "#9D858C",
    marginTop: 13,
  },
});