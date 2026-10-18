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
import * as SecureStore from "../utils/storage";

import { createChildProfile } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

export default function ChildProfileScreen() {
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Other");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { label: t.male, value: "Male" },
    { label: t.female, value: "Female" },
    { label: t.other, value: "Other" },
  ];

  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert(t.error, t.childName + " is required.");
      return;
    }

    if (!dateOfBirth.trim()) {
      Alert.alert(t.error, t.dateOfBirth + " is required.");
      return;
    }

    const normalizedDate = dateOfBirth.trim();
    const dateMatch =
      normalizedDate.match(/^(\d{2})-(\d{2})-(\d{4})$/) ||
      normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!dateMatch) {
      Alert.alert(t.error, "Please enter the date as DD-MM-YYYY or YYYY-MM-DD.");
      return;
    }

    const [, first, second, third] = dateMatch;
    const [year, month, day] =
      first.length === 4
        ? [first, second, third]
        : [third, second, first];
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      parsedDate.getFullYear() !== Number(year) ||
      parsedDate.getMonth() !== Number(month) - 1 ||
      parsedDate.getDate() !== Number(day) ||
      parsedDate.getTime() > new Date().setHours(23, 59, 59, 999)
    ) {
      Alert.alert(t.error, "Please enter a valid date that is not in the future.");
      return;
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
        childName: childName.trim(),
        dateOfBirth: `${year}-${month}-${day}`,
        gender,
        bloodGroup: bloodGroup.trim(),
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        notes: notes.trim(),
      };

      const result = await createChildProfile(token, profileData);

      if (result.success) {
        router.replace("/dashboard");
      } else {
        Alert.alert(t.error, result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Child profile error:", error);
      Alert.alert(t.error, "Something went wrong while saving the child profile.");
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
            <Text style={styles.title}>{t.childProfile}</Text>
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
          <Text style={styles.introEmoji}>👶</Text>
          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>{t.childProfileSubtitle}</Text>
            <Text style={styles.introText}>{t.childProfileDesc}</Text>
          </View>
        </View>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>{t.basicInformation}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t.childName} *</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Aarav"
            placeholderTextColor="#8AA9A2"
            value={childName}
            onChangeText={setChildName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>{t.dateOfBirth} *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="#8AA9A2"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <Text style={styles.helperText}>Example: 10-04-2025</Text>

          <Text style={styles.label}>{t.gender}</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.genderButton,
                  gender === item.value && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(item.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === item.value && styles.genderTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Information */}
        <Text style={styles.sectionTitle}>{t.healthInformation}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{t.bloodGroup}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: B+"
            placeholderTextColor="#8AA9A2"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
            maxLength={4}
          />

          <Text style={styles.label}>{t.height}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 72"
            placeholderTextColor="#8AA9A2"
            keyboardType="decimal-pad"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.label}>{t.weight}</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 8.2"
            placeholderTextColor="#8AA9A2"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>{t.additionalNotes}</Text>

        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder={t.childNotesPlaceholder}
            placeholderTextColor="#8AA9A2"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Privacy */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>{t.privacyNotice}</Text>
        </View>

        {/* Save */}
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
              <Text style={styles.saveButtonText}>{t.saveChildProfile}</Text>
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
    backgroundColor: "#F3FBF9",
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
    backgroundColor: "#DCEFEA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backText: {
    fontSize: 32,
    color: "#4E8277",
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
    color: "#57978B",
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#304E49",
  },
  langPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCE5DF",
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B7A70",
  },
  introCard: {
    flexDirection: "row",
    backgroundColor: "#E5F5F1",
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
    color: "#315E56",
    marginBottom: 5,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5C7E77",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#304E49",
    marginBottom: 10,
    marginLeft: 3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
    shadowColor: "#4D8278",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#48665F",
    marginBottom: 7,
    marginTop: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D5E8E3",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#304E49",
    backgroundColor: "#FBFEFD",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 11,
    color: "#8AA9A2",
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 3,
  },
  genderButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E8E3",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFEFD",
  },
  genderButtonSelected: {
    backgroundColor: "#72AFA3",
    borderColor: "#72AFA3",
  },
  genderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#608078",
  },
  genderTextSelected: {
    color: "#FFFFFF",
  },
  notesInput: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4F1",
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
    color: "#66817B",
  },
  saveButton: {
    height: 55,
    backgroundColor: "#72AFA3",
    borderRadius: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4E8C80",
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
    color: "#829D97",
    marginTop: 13,
  },
});
