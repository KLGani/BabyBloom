import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  createHealthRecord,
  getHealthRecords,
  deleteHealthRecord,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type HealthRecord = {
  _id: string;
  mode: "pregnancy" | "child";
  date: string;
  bloodPressure?: string;
  heartRate?: number | null;
  temperature?: number | null;
  bloodSugar?: number | null;
  weight?: number | null;
  height?: number | null;
  symptoms?: string;
  mood?: string;
  appetite?: string;
  sleepHours?: number | null;
  notes?: string;
};

export default function Health() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [mode, setMode] = useState<
    "pregnancy" | "child"
  >("pregnancy");

  const [records, setRecords] = useState<
    HealthRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [bloodPressure, setBloodPressure] =
    useState("");

  const [heartRate, setHeartRate] =
    useState("");

  const [temperature, setTemperature] =
    useState("");

  const [bloodSugar, setBloodSugar] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [symptoms, setSymptoms] =
    useState("");

  const [mood, setMood] =
    useState("");

  const [appetite, setAppetite] =
    useState("");

  const [sleepHours, setSleepHours] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {
    loadUserAndHealth();
  }, []);

  const loadUserAndHealth = async () => {
    try {
      const storedUser =
        await SecureStore.getItemAsync("user");

      const token =
        await SecureStore.getItemAsync("authToken");

      if (!storedUser || !token) {
        router.replace("/");
        return;
      }

      const user = JSON.parse(storedUser);

      const currentMode =
        user.mode === "child"
          ? "child"
          : "pregnancy";

      setMode(currentMode);

      await loadHealthRecords(
        token,
        currentMode
      );
    } catch (error) {
      console.log(
        "Health loading error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to load health data."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHealthRecords = async (
    token: string,
    currentMode: "pregnancy" | "child"
  ) => {
    const result = await getHealthRecords(
      token,
      currentMode
    );

    if (result.success) {
      setRecords(result.records || []);
    } else {
      setRecords([]);
    }
  };

  const resetForm = () => {
    setBloodPressure("");
    setHeartRate("");
    setTemperature("");
    setBloodSugar("");
    setWeight("");
    setHeight("");
    setSymptoms("");
    setMood("");
    setAppetite("");
    setSleepHours("");
    setNotes("");
  };

  const saveHealthRecord = async () => {
    try {
      if (
        !bloodPressure &&
        !heartRate &&
        !temperature &&
        !bloodSugar &&
        !weight &&
        !height &&
        !symptoms &&
        !mood &&
        !appetite &&
        !sleepHours &&
        !notes
      ) {
        Alert.alert(
          "Add health information",
          "Please enter at least one health detail."
        );

        return;
      }

      const token =
        await SecureStore.getItemAsync("authToken");

      if (!token) {
        router.replace("/");
        return;
      }

      setSaving(true);

      const healthData = {
        mode,

        bloodPressure:
          bloodPressure.trim(),

        heartRate:
          heartRate.trim()
            ? Number(heartRate)
            : null,

        temperature:
          temperature.trim()
            ? Number(temperature)
            : null,

        bloodSugar:
          bloodSugar.trim()
            ? Number(bloodSugar)
            : null,

        weight:
          weight.trim()
            ? Number(weight)
            : null,

        height:
          height.trim()
            ? Number(height)
            : null,

        symptoms:
          symptoms.trim(),

        mood:
          mood.trim(),

        appetite:
          appetite.trim(),

        sleepHours:
          sleepHours.trim()
            ? Number(sleepHours)
            : null,

        notes:
          notes.trim(),
      };

      const result =
        await createHealthRecord(
          token,
          healthData
        );

      if (result.success) {
        Alert.alert(
          "Saved successfully 🌸",
          "Your health record has been saved."
        );

        resetForm();
        setShowForm(false);

        await loadHealthRecords(
          token,
          mode
        );
      } else {
        Alert.alert(
          "Unable to save",
          result.message ||
            "Something went wrong."
        );
      }
    } catch (error) {
      console.log(
        "Save health record error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to save health record."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = (
    recordId: string
  ) => {
    Alert.alert(
      "Delete health record?",
      "This health record will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token =
                await SecureStore.getItemAsync(
                  "authToken"
                );

              if (!token) {
                router.replace("/");
                return;
              }

              const result =
                await deleteHealthRecord(
                  token,
                  recordId
                );

              if (result.success) {
                setRecords((previous) =>
                  previous.filter(
                    (record) =>
                      record._id !== recordId
                  )
                );
              } else {
                Alert.alert(
                  "Unable to delete",
                  result.message ||
                    "Something went wrong."
                );
              }
            } catch (error) {
              console.log(
                "Delete health record error:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to delete health record."
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, mode === "child" && styles.childScreen]}>
        <ActivityIndicator
          size="large"
          color="#B86D84"
        />

        <Text style={[styles.loadingText, mode === "child" && styles.childMutedText]}>
          Loading your health data...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, mode === "child" && styles.childScreen]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, mode === "child" && styles.childSoftSurface]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, mode === "child" && styles.childAccentText]}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, mode === "child" && styles.childHeadingText]}>
              {mode === "child" ? t.growthMetrics : t.healthTrackerTitle}
            </Text>

            <Text style={[styles.headerSubtitle, mode === "child" && styles.childMutedText]}>
              {t.healthTrackerSubtitle}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* MODE BADGE */}

        <View style={[styles.modeCard, mode === "child" && styles.childModeCard]}>
          <View>
            <Text style={[styles.modeLabel, mode === "child" && styles.childAccentText]}>
              {t.chooseYourMode.toUpperCase()}
            </Text>

            <Text style={[styles.modeText, mode === "child" && styles.childHeadingText]}>
              {mode === "pregnancy"
                ? `🤰 ${t.pregnancyMode}`
                : `👶 ${t.childMode}`}
            </Text>
          </View>

          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {t.confirm}
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={[styles.summaryCard, mode === "child" && styles.childSurface]}>
          <View style={[styles.summaryIcon, mode === "child" && styles.childSoftSurface]}>
            <Text style={styles.summaryEmoji}>
              💗
            </Text>
          </View>

          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryTitle, mode === "child" && styles.childHeadingText]}>
              {t.appName}
            </Text>

            <Text style={[styles.summaryText, mode === "child" && styles.childMutedText]}>
              {t.healthTrackerSubtitle}
            </Text>
          </View>
        </View>

        {/* ADD RECORD */}

        <TouchableOpacity
          style={[styles.addButton, mode === "child" && styles.childAccentSurface]}
          onPress={() =>
            setShowForm(!showForm)
          }
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonIcon}>
            {showForm ? "−" : "+"}
          </Text>

          <Text style={styles.addButtonText}>
            {showForm
              ? t.close
              : mode === "child" ? `+ ${t.growthMetrics}` : t.logVitals}
          </Text>
        </TouchableOpacity>

        {/* FORM */}

        {showForm && (
          <View style={[styles.formCard, mode === "child" && styles.childFormCard]}>
            <Text style={[styles.formTitle, mode === "child" && styles.childFormTitle]}>
              {mode === "child" ? "Today's child health check-in" : "Today's Health Details"}
            </Text>

            <Text style={styles.formSubtitle}>
              {mode === "child" ? "Add details you have measured or observed." : "Enter the information you would like to record."}
            </Text>

            {mode === "child" && <View>
              <View style={styles.childPromptCard}>
                <Text style={styles.childPromptEmoji}>🌿</Text>
                <Text style={styles.childPromptText}>A quick check-in is enough. Add only what you know, and leave anything else blank.</Text>
              </View>

              <View style={styles.childEntryGroup}>
                <View style={styles.childGroupHeading}><Text style={styles.childGroupEmoji}>🌡️</Text><View><Text style={styles.childGroupTitle}>Body & growth</Text><Text style={styles.childGroupHint}>Measurements, when you have them</Text></View></View>
                <Text style={[styles.inputLabel, styles.childInputLabel]}>Temperature (°C)</Text>
                <TextInput style={styles.childInput} placeholder="For example, 36.7" placeholderTextColor="#91AAA3" value={temperature} onChangeText={setTemperature} keyboardType="decimal-pad" />
                <View style={styles.childInputRow}>
                  <View style={styles.childInputColumn}><Text style={[styles.inputLabel, styles.childInputLabel]}>Weight (kg)</Text><TextInput style={styles.childInput} placeholder="For example, 8.2" placeholderTextColor="#91AAA3" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
                  <View style={styles.childInputColumn}><Text style={[styles.inputLabel, styles.childInputLabel]}>Height (cm)</Text><TextInput style={styles.childInput} placeholder="For example, 72" placeholderTextColor="#91AAA3" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /></View>
                </View>
              </View>

              <View style={styles.childEntryGroup}>
                <View style={styles.childGroupHeading}><Text style={styles.childGroupEmoji}>☀️</Text><View><Text style={styles.childGroupTitle}>How was their day?</Text><Text style={styles.childGroupHint}>Little observations can help later</Text></View></View>
                <Text style={[styles.inputLabel, styles.childInputLabel]}>Energy or mood</Text>
                <TextInput style={styles.childInput} placeholder="Playful, settled, unusually quiet…" placeholderTextColor="#91AAA3" value={mood} onChangeText={setMood} />
                <Text style={[styles.inputLabel, styles.childInputLabel]}>Appetite and fluids</Text>
                <TextInput style={styles.childInput} placeholder="Usual, less than usual, drinking well…" placeholderTextColor="#91AAA3" value={appetite} onChangeText={setAppetite} />
                <Text style={[styles.inputLabel, styles.childInputLabel]}>Sleep (hours, optional)</Text>
                <TextInput style={styles.childInput} placeholder="Include naps if useful" placeholderTextColor="#91AAA3" value={sleepHours} onChangeText={setSleepHours} keyboardType="decimal-pad" />
              </View>

              <View style={styles.childEntryGroup}>
                <View style={styles.childGroupHeading}><Text style={styles.childGroupEmoji}>📝</Text><View><Text style={styles.childGroupTitle}>Anything to remember?</Text><Text style={styles.childGroupHint}>Add a symptom, change, or question</Text></View></View>
                <TextInput style={[styles.childInput, styles.textArea]} placeholder="What did you notice, and when?" placeholderTextColor="#91AAA3" value={symptoms} onChangeText={setSymptoms} multiline numberOfLines={3} />
                <TextInput style={[styles.childInput, styles.textArea, { marginTop: 9 }]} placeholder="A note for your next appointment…" placeholderTextColor="#91AAA3" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
              </View>
            </View>}

            {mode === "pregnancy" && (
              <>
                {/* BLOOD PRESSURE */}
                <Text style={styles.inputLabel}>Blood Pressure</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 120/80"
                  placeholderTextColor="#B29AA2"
                  value={bloodPressure}
                  onChangeText={setBloodPressure}
                  keyboardType="numbers-and-punctuation"
                />

                {/* HEART RATE */}
                <Text style={styles.inputLabel}>Heart Rate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Beats per minute"
                  placeholderTextColor="#B29AA2"
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType="numeric"
                />

                {/* TEMPERATURE */}
                <Text style={styles.inputLabel}>Temperature (°C)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 36.7"
                  placeholderTextColor="#B29AA2"
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="decimal-pad"
                />

                {/* BLOOD SUGAR */}
                <Text style={styles.inputLabel}>Blood Sugar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 95"
                  placeholderTextColor="#B29AA2"
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                  keyboardType="numeric"
                />

                {/* WEIGHT */}
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 61"
                  placeholderTextColor="#B29AA2"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />

                {/* HEIGHT */}
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 160"
                  placeholderTextColor="#B29AA2"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />

                {/* MOOD */}
                <Text style={styles.inputLabel}>Mood</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: Happy"
                  placeholderTextColor="#B29AA2"
                  value={mood}
                  onChangeText={setMood}
                />

                {/* APPETITE */}
                <Text style={styles.inputLabel}>Appetite</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: Good"
                  placeholderTextColor="#B29AA2"
                  value={appetite}
                  onChangeText={setAppetite}
                />

                {/* SLEEP */}
                <Text style={styles.inputLabel}>Sleep (hours)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 7"
                  placeholderTextColor="#B29AA2"
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  keyboardType="decimal-pad"
                />

                {/* SYMPTOMS */}
                <Text style={styles.inputLabel}>Symptoms</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe any symptoms..."
                  placeholderTextColor="#B29AA2"
                  value={symptoms}
                  onChangeText={setSymptoms}
                  multiline
                  numberOfLines={3}
                />

                {/* NOTES */}
                <Text style={styles.inputLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Anything else you would like to record..."
                  placeholderTextColor="#B29AA2"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {/* SAVE */}

            <TouchableOpacity
              style={[styles.saveButton, mode === "child" && styles.childSaveButton, saving && styles.disabledButton]}
              onPress={saveHealthRecord}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.saveButtonText}
                >
                  {saving ? t.loading : `${t.save} 💗`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORY */}

        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, mode === "child" && styles.childHeadingText]}>
            {mode === "child" ? t.growthMetrics : t.health}
          </Text>

          <Text style={[styles.recordCount, mode === "child" && styles.childAccentText]}>
            {records.length}{" "}
            {records.length === 1
              ? "record"
              : "records"}
          </Text>
        </View>

        {records.length === 0 ? (
          <View style={[styles.emptyCard, mode === "child" && styles.childSurface]}>
            <Text style={styles.emptyEmoji}>
              🌷
            </Text>

            <Text style={[styles.emptyTitle, mode === "child" && styles.childHeadingText]}>
              {mode === "child" ? t.growthMetrics : t.health}
            </Text>

            <Text style={[styles.emptyText, mode === "child" && styles.childMutedText]}>
              {t.tagline}
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <View
              key={record._id}
              style={[styles.recordCard, mode === "child" && styles.childSurface]}
            >
              {/* RECORD HEADER */}

              <View
                style={styles.recordHeader}
              >
                <View>
                  <Text
                    style={[styles.recordDate, mode === "child" && styles.childHeadingText]}
                  >
                    {formatDate(
                      record.date
                    )}
                  </Text>

                  <Text
                    style={[styles.recordMode, mode === "child" && styles.childMutedText]}
                  >
                    {record.mode ===
                    "pregnancy"
                      ? t.pregnancy
                      : t.child}{" "}
                    {t.health}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    removeRecord(
                      record._id
                    )
                  }
                >
                  <Text
                    style={[styles.deleteText, mode === "child" && styles.childDeleteText]}
                  >
                    {t.delete}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* HEALTH VALUES */}

              <View
                style={styles.recordGrid}
              >
                {mode === "pregnancy" && record.bloodPressure && (
                  <HealthValue mode={mode}
                    icon="❤️"
                    label="Blood Pressure"
                    value={
                      record.bloodPressure
                    }
                  />
                )}

                {record.heartRate !==
                  null &&
                  record.heartRate !==
                    undefined && (
                    <HealthValue mode={mode}
                      icon="💓"
                      label="Heart Rate"
                      value={`${record.heartRate} bpm`}
                    />
                  )}

                {record.temperature !==
                  null &&
                  record.temperature !==
                    undefined && (
                    <HealthValue mode={mode}
                      icon="🌡️"
                      label="Temperature"
                      value={`${record.temperature} °C`}
                    />
                  )}

                {mode === "pregnancy" && record.bloodSugar !==
                  null &&
                  record.bloodSugar !==
                    undefined && (
                  <HealthValue mode={mode}
                      icon="🩸"
                      label="Blood Sugar"
                      value={`${record.bloodSugar}`}
                    />
                  )}

                {record.weight !==
                  null &&
                  record.weight !==
                    undefined && (
                    <HealthValue mode={mode}
                      icon="⚖️"
                      label="Weight"
                      value={`${record.weight} kg`}
                    />
                  )}

                {record.height !==
                  null &&
                  record.height !==
                    undefined && (
                    <HealthValue mode={mode}
                      icon="📏"
                      label="Height"
                      value={`${record.height} cm`}
                    />
                  )}

                {record.sleepHours !==
                  null &&
                  record.sleepHours !==
                    undefined && (
                    <HealthValue
                      icon="😴"
                      label="Sleep"
                      value={`${record.sleepHours} hrs`}
                    />
                  )}
              </View>

              {/* MOOD */}

              {record.mood && (
                <View
                  style={styles.textInfoBox}
                >
                  <Text
                    style={
                      styles.textInfoLabel
                    }
                  >
                    😊 Mood
                  </Text>

                  <Text
                    style={
                      styles.textInfoValue
                    }
                  >
                    {record.mood}
                  </Text>
                </View>
              )}

              {/* APPETITE */}

              {record.appetite && (
                <View
                  style={styles.textInfoBox}
                >
                  <Text
                    style={
                      styles.textInfoLabel
                    }
                  >
                    🍎 Appetite
                  </Text>

                  <Text
                    style={
                      styles.textInfoValue
                    }
                  >
                    {record.appetite}
                  </Text>
                </View>
              )}

              {/* SYMPTOMS */}

              {record.symptoms && (
                <View
                  style={styles.textInfoBox}
                >
                  <Text
                    style={
                      styles.textInfoLabel
                    }
                  >
                    🩺 Symptoms
                  </Text>

                  <Text
                    style={
                      styles.textInfoValue
                    }
                  >
                    {record.symptoms}
                  </Text>
                </View>
              )}

              {/* NOTES */}

              {record.notes && (
                <View
                  style={styles.notesBox}
                >
                  <Text
                    style={styles.notesLabel}
                  >
                    📝 Notes
                  </Text>

                  <Text
                    style={styles.notesText}
                  >
                    {record.notes}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {/* DISCLAIMER */}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {t.disclaimer}
          </Text>
        </View>
      </ScrollView>

      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   HEALTH VALUE COMPONENT
========================================================= */

function HealthValue({
  icon,
  label,
  value,
  mode,
}: {
  icon: string;
  label: string;
  value: string;
  mode?: "pregnancy" | "child";
}) {
  const isChild = mode === "child";
  return (
    <View style={[styles.healthValue, isChild && { backgroundColor: "#F0F8F5" }]}>
      <Text style={styles.healthValueIcon}>
        {icon}
      </Text>

      <Text style={[styles.healthValueLabel, isChild && { color: "#598177" }]}>
        {label}
      </Text>

      <Text style={[styles.healthValueText, isChild && { color: "#2E554F" }]}>
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
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
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#F8DFE7",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 32,
    color: "#9F5F75",
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#54313D",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#96717D",
    marginTop: 3,
  },

  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F8DFE7",
    borderWidth: 1,
    borderColor: "#E6B8C7",
  },

  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8F5369",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8DFE7",
    justifyContent: "center",
    alignItems: "center",
  },

  headerEmoji: {
    fontSize: 23,
  },

  modeCard: {
    backgroundColor: "#EFD6DF",
    borderRadius: 22,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  modeLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#916074",
    letterSpacing: 1,
  },

  modeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#54313D",
    marginTop: 4,
  },

  modeBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
  },

  modeBadgeText: {
    fontSize: 10,
    color: "#6E9A78",
    fontWeight: "800",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F9E4EB",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryEmoji: {
    fontSize: 27,
  },

  summaryInfo: {
    flex: 1,
    marginLeft: 13,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#54313D",
  },

  summaryText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#856D76",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#B86D84",
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  addButtonIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "400",
    marginRight: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 19,
    marginBottom: 25,
    elevation: 2,
  },

  childFormCard: {
    backgroundColor: "#F2FAF6",
    borderWidth: 1,
    borderColor: "#D9ECE4",
  },

  childFormTitle: {
    color: "#315D57",
    fontSize: 21,
  },

  childPromptCard: {
    backgroundColor: "#E1F1E9",
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  childPromptEmoji: {
    fontSize: 23,
    marginRight: 10,
  },

  childPromptText: {
    flex: 1,
    fontSize: 11,
    color: "#56786F",
    lineHeight: 16,
  },

  childEntryGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E4F0EB",
  },

  childGroupHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  childGroupEmoji: {
    width: 38,
    height: 38,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    backgroundColor: "#EFF7F3",
    borderRadius: 13,
    overflow: "hidden",
    marginRight: 10,
  },

  childGroupTitle: {
    color: "#315D57",
    fontSize: 14,
    fontWeight: "900",
  },

  childGroupHint: {
    color: "#819B93",
    fontSize: 10,
    marginTop: 2,
  },

  childInputRow: {
    flexDirection: "row",
    gap: 10,
  },

  childInputColumn: {
    flex: 1,
  },

  childInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#DCEBE5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#315D57",
    backgroundColor: "#FBFEFC",
    fontSize: 13,
  },

  childSaveButton: {
    backgroundColor: "#68A995",
  },

  formTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#54313D",
  },

  formSubtitle: {
    fontSize: 12,
    color: "#90757E",
    marginTop: 4,
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#65434E",
    marginBottom: 7,
    marginTop: 11,
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

  saveButton: {
    backgroundColor: "#B86D84",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#54313D",
  },

  recordCount: {
    fontSize: 11,
    color: "#A36B7D",
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyEmoji: {
    fontSize: 34,
    marginBottom: 9,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#54313D",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#90757E",
    marginTop: 6,
  },

  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 17,
    marginBottom: 15,
    elevation: 2,
  },

  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  recordDate: {
    fontSize: 15,
    fontWeight: "900",
    color: "#54313D",
  },

  recordMode: {
    fontSize: 10,
    color: "#9A7883",
    marginTop: 3,
  },

  deleteText: {
    color: "#C96B78",
    fontSize: 11,
    fontWeight: "800",
  },

  recordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  healthValue: {
    width: "48%",
    backgroundColor: "#FFF6F8",
    borderRadius: 15,
    padding: 12,
    marginBottom: 9,
  },

  healthValueIcon: {
    fontSize: 18,
    marginBottom: 4,
  },

  healthValueLabel: {
    fontSize: 9,
    color: "#977983",
    fontWeight: "700",
  },

  healthValueText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#5D3D49",
    marginTop: 2,
  },

  textInfoBox: {
    backgroundColor: "#FAF0F3",
    borderRadius: 14,
    padding: 11,
    marginTop: 4,
  },

  textInfoLabel: {
    fontSize: 10,
    color: "#9A7180",
    fontWeight: "800",
  },

  textInfoValue: {
    fontSize: 12,
    color: "#65434E",
    marginTop: 3,
    lineHeight: 17,
  },

  notesBox: {
    backgroundColor: "#FFF4DF",
    borderRadius: 14,
    padding: 11,
    marginTop: 9,
  },

  notesLabel: {
    fontSize: 10,
    color: "#9C713A",
    fontWeight: "800",
  },

  notesText: {
    fontSize: 12,
    color: "#715638",
    lineHeight: 17,
    marginTop: 3,
  },

  disclaimer: {
    backgroundColor: "#F4EAF5",
    borderRadius: 18,
    padding: 14,
    marginTop: 5,
  },

  disclaimerText: {
    fontSize: 10,
    color: "#77647C",
    lineHeight: 16,
    textAlign: "center",
  },

  childInputLabel: {
    color: "#315D57",
  },

  childHeadingText: {
    color: "#2E554F",
  },

  childAccentText: {
    color: "#54887C",
  },

  childSurface: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E4F0EB",
    borderWidth: 1,
  },

  childMutedText: {
    color: "#74938B",
  },

  childDeleteText: {
    color: "#A85764",
  },

  childScreen: {
    backgroundColor: "#F4FAF7",
  },

  childSoftSurface: {
    backgroundColor: "#E6F3EE",
  },

  childModeCard: {
    backgroundColor: "#E2F2EC",
    borderColor: "#CDE3DB",
    borderWidth: 1,
  },

  childAccentSurface: {
    backgroundColor: "#4F8D7D",
  },
});
