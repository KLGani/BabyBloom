import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { goBackOrReplace } from "../utils/navigation";
import * as SecureStore from "../utils/storage";

import {
  getPregnancyProfile,
  updatePregnancyProfile,
  getChildProfile,
  updateChildProfile,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Mode = "pregnancy" | "child";

export default function EditProfile() {
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const [mode, setMode] = useState<Mode>("pregnancy");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pregnancy
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pregnancyBloodGroup, setPregnancyBloodGroup] = useState("");
  const [pregnancyHeight, setPregnancyHeight] = useState("");
  const [prePregnancyWeight, setPrePregnancyWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [pregnancyNotes, setPregnancyNotes] = useState("");

  // Child
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Other");
  const [childBloodGroup, setChildBloodGroup] = useState("");
  const [childHeight, setChildHeight] = useState("");
  const [childWeight, setChildWeight] = useState("");
  const [childNotes, setChildNotes] = useState("");

  const genderOptions = [
    { label: t.male, value: "Male" },
    { label: t.female, value: "Female" },
    { label: t.other, value: "Other" },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const storedUser = await SecureStore.getItemAsync("user");

      if (!token || !storedUser) {
        router.replace("/");
        return;
      }

      const user = JSON.parse(storedUser);
      const currentMode: Mode = user.mode === "child" ? "child" : "pregnancy";
      setMode(currentMode);

      if (currentMode === "pregnancy") {
        const result = await getPregnancyProfile(token);
        if (result.success && result.profile) {
          const profile = result.profile;
          setPregnancyWeek(
            profile.pregnancyWeek ? String(profile.pregnancyWeek) : ""
          );
          setDueDate(
            profile.dueDate ? String(profile.dueDate).substring(0, 10) : ""
          );
          setPregnancyBloodGroup(profile.bloodGroup || "");
          setPregnancyHeight(
            profile.height !== null && profile.height !== undefined
              ? String(profile.height)
              : ""
          );
          setPrePregnancyWeight(
            profile.prePregnancyWeight !== null &&
              profile.prePregnancyWeight !== undefined
              ? String(profile.prePregnancyWeight)
              : ""
          );
          setCurrentWeight(
            profile.currentWeight !== null && profile.currentWeight !== undefined
              ? String(profile.currentWeight)
              : ""
          );
          setPregnancyNotes(profile.notes || "");
        }
      } else {
        const result = await getChildProfile(token);
        if (result.success && result.profile) {
          const profile = result.profile;
          setChildName(profile.childName || "");
          setDateOfBirth(
            profile.dateOfBirth ? String(profile.dateOfBirth).substring(0, 10) : ""
          );
          setGender(profile.gender || "Other");
          setChildBloodGroup(profile.bloodGroup || "");
          setChildHeight(
            profile.height !== null && profile.height !== undefined
              ? String(profile.height)
              : ""
          );
          setChildWeight(
            profile.weight !== null && profile.weight !== undefined
              ? String(profile.weight)
              : ""
          );
          setChildNotes(profile.notes || "");
        }
      }
    } catch (error) {
      console.log("Load edit profile error:", error);
      Alert.alert(t.error, "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const validateDate = (value: string) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  };

  const saveProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }

      if (mode === "pregnancy") {
        const week = Number(pregnancyWeek);
        if (!pregnancyWeek || week < 1 || week > 42) {
          Alert.alert(t.error, t.weekRangeNote);
          return;
        }

        if (dueDate && !validateDate(dueDate)) {
          Alert.alert(t.error, "Please use YYYY-MM-DD format for date.");
          return;
        }

        setSaving(true);

        const result = await updatePregnancyProfile(token, {
          pregnancyWeek: week,
          dueDate: dueDate.trim() ? dueDate.trim() : null,
          bloodGroup: pregnancyBloodGroup.trim(),
          height: pregnancyHeight.trim() ? Number(pregnancyHeight) : null,
          prePregnancyWeight: prePregnancyWeight.trim()
            ? Number(prePregnancyWeight)
            : null,
          currentWeight: currentWeight.trim() ? Number(currentWeight) : null,
          notes: pregnancyNotes.trim(),
        });

        if (result.success) {
          Alert.alert(
            t.success + " 🌸",
            "Your profile has been updated successfully.",
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
      } else {
        if (!childName.trim()) {
          Alert.alert(t.error, t.childName + " is required.");
          return;
        }

        if (!dateOfBirth || !validateDate(dateOfBirth)) {
          Alert.alert(t.error, "Please enter the date of birth in YYYY-MM-DD format.");
          return;
        }

        setSaving(true);

        const result = await updateChildProfile(token, {
          childName: childName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          gender,
          bloodGroup: childBloodGroup.trim(),
          height: childHeight.trim() ? Number(childHeight) : null,
          weight: childWeight.trim() ? Number(childWeight) : null,
          notes: childNotes.trim(),
        });

        if (result.success) {
          Alert.alert(
            t.success + " 🌱",
            "Your profile has been updated successfully.",
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
      }
    } catch (error) {
      console.log("Save profile error:", error);
      Alert.alert(t.error, "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B86D84" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBackOrReplace()}
            disabled={saving}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.title}>{t.editProfile}</Text>
            <Text style={styles.subtitle}>{t.editProfileSubtitle}</Text>
          </View>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* MODE */}
        <View style={styles.modeCard}>
          <Text style={styles.modeEmoji}>
            {mode === "pregnancy" ? "🤰" : "👶"}
          </Text>
          <View>
            <Text style={styles.modeLabel}>{t.editing}</Text>
            <Text style={styles.modeText}>
              {mode === "pregnancy" ? t.pregnancyProfile : t.childProfile}
            </Text>
          </View>
        </View>

        {/* PREGNANCY */}
        {mode === "pregnancy" ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t.pregnancyInformation}</Text>

            <Text style={styles.inputLabel}>{t.currentPregnancyWeek}</Text>
            <TextInput
              style={styles.input}
              value={pregnancyWeek}
              onChangeText={setPregnancyWeek}
              placeholder="Example: 20"
              placeholderTextColor="#B69CA6"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>{t.expectedDueDate}</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#B69CA6"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.inputLabel}>{t.bloodGroup}</Text>
            <TextInput
              style={styles.input}
              value={pregnancyBloodGroup}
              onChangeText={setPregnancyBloodGroup}
              placeholder="Example: B+"
              placeholderTextColor="#B69CA6"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>{t.height}</Text>
            <TextInput
              style={styles.input}
              value={pregnancyHeight}
              onChangeText={setPregnancyHeight}
              placeholder="Example: 160"
              placeholderTextColor="#B69CA6"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t.prePregnancyWeight}</Text>
            <TextInput
              style={styles.input}
              value={prePregnancyWeight}
              onChangeText={setPrePregnancyWeight}
              placeholder="Example: 56"
              placeholderTextColor="#B69CA6"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t.currentWeight}</Text>
            <TextInput
              style={styles.input}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              placeholder="Example: 61"
              placeholderTextColor="#B69CA6"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t.additionalNotes}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={pregnancyNotes}
              onChangeText={setPregnancyNotes}
              placeholder={t.pregnancyNotesPlaceholder}
              placeholderTextColor="#B69CA6"
              multiline
              numberOfLines={4}
            />
          </View>
        ) : (
          /* CHILD */
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t.basicInformation}</Text>

            <Text style={styles.inputLabel}>{t.childName}</Text>
            <TextInput
              style={styles.input}
              value={childName}
              onChangeText={setChildName}
              placeholder="Example: Aarav"
              placeholderTextColor="#B69CA6"
            />

            <Text style={styles.inputLabel}>{t.dateOfBirth}</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#B69CA6"
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.inputLabel}>{t.gender}</Text>
            <View style={styles.genderRow}>
              {genderOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.genderButton,
                    gender === item.value && styles.genderSelected,
                  ]}
                  onPress={() => setGender(item.value)}
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

            <Text style={styles.inputLabel}>{t.bloodGroup}</Text>
            <TextInput
              style={styles.input}
              value={childBloodGroup}
              onChangeText={setChildBloodGroup}
              placeholder="Example: B+"
              placeholderTextColor="#B69CA6"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>{t.height}</Text>
            <TextInput
              style={styles.input}
              value={childHeight}
              onChangeText={setChildHeight}
              placeholder="Example: 72"
              placeholderTextColor="#B69CA6"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t.weight}</Text>
            <TextInput
              style={styles.input}
              value={childWeight}
              onChangeText={setChildWeight}
              placeholder="Example: 8.2"
              placeholderTextColor="#B69CA6"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t.additionalNotes}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={childNotes}
              onChangeText={setChildNotes}
              placeholder={t.childNotesPlaceholder}
              placeholderTextColor="#B69CA6"
              multiline
              numberOfLines={4}
            />
          </View>
        )}

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={saveProfile}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t.saveChanges}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => goBackOrReplace()}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>{t.cancel}</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>🔒</Text>
          <Text style={styles.infoText}>{t.privacyNotice}</Text>
        </View>

        <LanguageSelectorModal
          visible={showLangModal}
          onClose={() => setShowLangModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 45,
    paddingBottom: 45,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF7F9",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#80616C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8DFE7",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 32,
    color: "#9F5F75",
    marginTop: -3,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 13,
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#54313D",
  },
  subtitle: {
    fontSize: 11,
    color: "#96717D",
    marginTop: 3,
  },
  langPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EBD7DE",
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9F5F75",
  },
  modeCard: {
    backgroundColor: "#F1E1E7",
    borderRadius: 21,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },
  modeEmoji: {
    fontSize: 30,
    marginRight: 13,
  },
  modeLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#986679",
    letterSpacing: 1,
  },
  modeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#54313D",
    marginTop: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 19,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#54313D",
    marginBottom: 7,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#65434E",
    marginTop: 13,
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#EBD7DE",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#54313D",
    backgroundColor: "#FFFBFC",
    fontSize: 13,
  },
  textArea: {
    height: 90,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#EBD7DE",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFBFC",
  },
  genderSelected: {
    backgroundColor: "#F1DCE4",
    borderColor: "#B86D84",
  },
  genderText: {
    fontSize: 12,
    color: "#80616C",
    fontWeight: "700",
  },
  genderTextSelected: {
    color: "#8F5269",
  },
  saveButton: {
    backgroundColor: "#B86D84",
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  cancelButton: {
    height: 50,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9,
  },
  cancelText: {
    color: "#986679",
    fontSize: 14,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#F5EAF0",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  infoEmoji: {
    fontSize: 21,
    marginRight: 9,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#77616B",
  },
});