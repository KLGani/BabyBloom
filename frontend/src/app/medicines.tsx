import { syncMedicineNotifications } from "../utils/medicineNotifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "../utils/storage";
import {
  createMedicine,
  getMedicines,
  deleteMedicine as deleteMedicineAPI,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  notes: string;
};

const normalizeMedicine = (item: any): Medicine => ({
  id: String(item._id || item.id),
  name: item.name || "",
  dosage: item.dosage || "",
  frequency: item.frequency || "Once daily",
  times: Array.isArray(item.times)
    ? item.times
    : typeof item.times === "string"
      ? item.times.split(",").map((time: string) => time.trim())
      : [],
  startDate: item.startDate || "",
  endDate: item.endDate || "",
  notes: item.notes || "",
});

const toISODate = (date: string): string | null => {
  const value = date.trim();
  if (!value) return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

const toDisplayDate = (date: string): string => {
  if (!date) return "";

  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date;

  return `${match[3]}/${match[2]}/${match[1]}`;
};

export default function Medicines() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [times, setTimes] = useState(["09:00 AM"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");

        if (!token) {
          router.replace("/");
          return;
        }

        const response = await getMedicines(token);

        
if (response.success) {
  const loadedMedicines = (response.medicines || []).map(
    normalizeMedicine
  );

  setMedicines(loadedMedicines);

  await syncMedicineNotifications(loadedMedicines);
}

      } catch {
        Alert.alert("Error", "Unable to load your saved medicines.");
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("Once daily");
    setTimes(["09:00 AM"]);
    setStartDate("");
    setEndDate("");
    setNotes("");
  };

  const getRequiredTimeCount = () => {
    if (frequency === "Once daily") return 1;
    if (frequency === "Twice daily") return 2;
    if (frequency === "Three times daily") return 3;
    return times.length;
  };

  const changeFrequency = (option: string) => {
    setFrequency(option);

    const requiredCount =
      option === "Once daily"
        ? 1
        : option === "Twice daily"
          ? 2
          : option === "Three times daily"
            ? 3
            : times.length;

    setTimes((previous) => {
      const updated = [...previous];

      while (updated.length < requiredCount) {
        updated.push("");
      }

      return updated;
    });
  };

  const updateReminderTime = (index: number, value: string) => {
    setTimes((previous) => {
      const updated = [...previous];
      updated[index] = value;
      return updated;
    });
  };

  const saveMedicine = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter the medicine name and dosage."
      );
      return;
    }

    const startISO = toISODate(startDate);
    const endISO = toISODate(endDate);

    if (startDate.trim() && !startISO) {
      Alert.alert(
        "Invalid Start Date",
        "Enter a valid date in DD/MM/YYYY format, for example 15/02/2027."
      );
      return;
    }

    if (endDate.trim() && !endISO) {
      Alert.alert(
        "Invalid End Date",
        "Enter a valid date in DD/MM/YYYY format, for example 15/02/2027."
      );
      return;
    }

    if (startISO && endISO && endISO < startISO) {
      Alert.alert(
        "Invalid Date Range",
        "The end date cannot be earlier than the start date."
      );
      return;
    }

    const requiredTimeCount = getRequiredTimeCount();
    const selectedTimes = times
      .slice(0, requiredTimeCount)
      .map((time) => time.trim());

    if (selectedTimes.some((time) => !time)) {
      Alert.alert(
        "Missing Reminder Time",
        "Please fill in every reminder time."
      );
      return;
    }

    setSaving(true);

    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert("Session Expired", "Please sign in again.");
        router.replace("/");
        return;
      }

      const medicineData = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        times: selectedTimes,
        startDate: startISO || "",
        endDate: endISO || "",
        notes: notes.trim(),
      };

      const response = await createMedicine(token, medicineData);

      if (!response.success || !response.medicine) {
        Alert.alert(
          "Unable to Save",
          response.message || "Please try again."
        );
        return;
      }

      const savedMedicine = normalizeMedicine(response.medicine);

      
const updatedMedicines = [savedMedicine, ...medicines];

setMedicines(updatedMedicines);

await syncMedicineNotifications(updatedMedicines);


      resetForm();
      setShowForm(false);

      Alert.alert(
        "Medicine Saved 💗",
        "Your medicine has been saved successfully."
      );
    } catch {
      Alert.alert(
        "Error",
        "Unable to save your medicine. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMedicine = (id: string) => {
    Alert.alert(
      "Delete Medicine",
      "Do you want to remove this medicine?",
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
              const token = await SecureStore.getItemAsync("authToken");

              if (!token) {
                Alert.alert("Session Expired", "Please sign in again.");
                router.replace("/");
                return;
              }

              const response = await deleteMedicineAPI(token, id);

              if (!response.success) {
                Alert.alert(
                  "Unable to Delete",
                  response.message || "Please try again."
                );
                return;
              }

              
const updatedMedicines = medicines.filter(
  (medicine) => medicine.id !== id
);

setMedicines(updatedMedicines);

await syncMedicineNotifications(updatedMedicines);

Alert.alert("Deleted", "Medicine removed successfully.");

                
            } catch {
              Alert.alert("Error", "Unable to delete this medicine.");
            }
          },
        },
      ]
    );
  };

    return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>{t.medicinesTitle}</Text>
            <Text style={styles.subtitle}>
              {t.medicinesSubtitle}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeIcon}>🌷</Text>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              {t.appName}
            </Text>
            <Text style={styles.welcomeDescription}>
              {t.medicinesSubtitle}
            </Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderIcon}>⏰</Text>
          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>
              {t.notificationsTitle}
            </Text>
            <Text style={styles.reminderDescription}>
              {t.permissionNotificationsDesc}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? t.close : t.addMedicine}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              {t.addMedicine}
            </Text>

            <Text style={styles.label}>{t.medicineName} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.medicineName}
              placeholderTextColor="#B79BA5"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t.dosage} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.dosage}
              placeholderTextColor="#B79BA5"
              value={dosage}
              onChangeText={setDosage}
            />

            <Text style={styles.label}>{t.frequency}</Text>
            <View style={styles.frequencyContainer}>
              {[
                "Once daily",
                "Twice daily",
                "Three times daily",
                "As prescribed",
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.frequencyOption,
                    frequency === option && styles.frequencySelected,
                  ]}
                  onPress={() => changeFrequency(option)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === option &&
                        styles.frequencySelectedText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Reminder Time(s)</Text>

            {(frequency === "Once daily"
              ? [0]
              : frequency === "Twice daily"
                ? [0, 1]
                : frequency === "Three times daily"
                  ? [0, 1, 2]
                  : times.map((_, index) => index)
            ).map((index) => (
              <View key={index}>
                <Text style={styles.timeLabel}>
                  Reminder {index + 1}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Example: 09:00 AM"
                  placeholderTextColor="#B79BA5"
                  value={times[index] || ""}
                  onChangeText={(value) =>
                    updateReminderTime(index, value)
                  }
                />
              </View>
            ))}

            {frequency === "As prescribed" && (
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={() =>
                  setTimes((previous) => [...previous, ""])
                }
              >
                <Text style={styles.addTimeButtonText}>
                  + Add another reminder time
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>{t.startDate}</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#B79BA5"
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>{t.endDate}</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#B79BA5"
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>{t.notes}</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder={t.notes}
              placeholderTextColor="#B79BA5"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={saveMedicine}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? t.loading : `${t.saveMedicine} 💗`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.historyTitle}>{t.medicines}</Text>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyDescription}>
              {t.loading}
            </Text>
          </View>
        ) : medicines.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyTitle}>
              {t.noMedicines}
            </Text>
            <Text style={styles.emptyDescription}>
              {t.noMedicinesDesc}
            </Text>
          </View>
        ) : (
          medicines.map((medicine) => (
            <View
              key={medicine.id}
              style={styles.medicineCard}
            >
              <View style={styles.medicineTop}>
                <View style={styles.medicineIconBox}>
                  <Text style={styles.medicineIcon}>💊</Text>
                </View>

                <View style={styles.medicineHeading}>
                  <Text style={styles.medicineName}>
                    {medicine.name}
                  </Text>
                  <Text style={styles.medicineDosage}>
                    {t.dosage}: {medicine.dosage}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteMedicine(medicine.id)}
                >
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardDivider} />

              <Text style={styles.detailText}>
                🔁 {medicine.frequency}
              </Text>

              {medicine.times.length > 0 && (
                <Text style={styles.detailText}>
                  ⏰ {medicine.times.join(", ")}
                </Text>
              )}

              {medicine.startDate ? (
                <Text style={styles.detailText}>
                  📅 {t.startDate}: {toDisplayDate(medicine.startDate)}
                </Text>
              ) : null}

              {medicine.endDate ? (
                <Text style={styles.detailText}>
                  📅 {t.endDate}: {toDisplayDate(medicine.endDate)}
                </Text>
              ) : null}

              {medicine.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>{t.notes}</Text>
                  <Text style={styles.notesText}>
                    {medicine.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF7F9",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
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
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8DFE7",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 34,
    color: "#8F5369",
    lineHeight: 36,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#54313D",
  },
  subtitle: {
    fontSize: 12,
    color: "#9A7480",
    marginTop: 3,
  },
  headerIcon: {
    fontSize: 30,
  },
  welcomeCard: {
    flexDirection: "row",
    backgroundColor: "#FBE8EE",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  welcomeIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#633B49",
    marginBottom: 5,
  },
  welcomeDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7E5C67",
  },
  reminderCard: {
    flexDirection: "row",
    backgroundColor: "#F1EAFB",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  reminderIcon: {
    fontSize: 25,
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#614778",
    marginBottom: 5,
  },
  reminderDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78648B",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8F5369",
    marginBottom: 6,
  },
  addButton: {
    backgroundColor: "#B86D84",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 22,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F1D9E1",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#54313D",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#704957",
    marginBottom: 7,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#FFF7F9",
    borderWidth: 1,
    borderColor: "#EBD1DA",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#54313D",
    marginBottom: 12,
  },
  notesInput: {
    height: 90,
  },
  frequencyContainer: {
    gap: 8,
    marginBottom: 12,
  },
  frequencyOption: {
    borderWidth: 1,
    borderColor: "#EBD1DA",
    borderRadius: 12,
    padding: 11,
    backgroundColor: "#FFF7F9",
  },
  frequencySelected: {
    backgroundColor: "#F8DFE7",
    borderColor: "#B86D84",
  },
  frequencyText: {
    fontSize: 13,
    color: "#765762",
    textAlign: "center",
  },
  frequencySelectedText: {
    color: "#8F5369",
    fontWeight: "700",
  },
  addTimeButton: {
    backgroundColor: "#FBE8EE",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  addTimeButtonText: {
    color: "#8F5369",
    fontSize: 13,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#D994A8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#54313D",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1D9E1",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#68404E",
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#9A7480",
    textAlign: "center",
    lineHeight: 19,
  },
  medicineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1D9E1",
  },
  medicineTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicineIconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FBE8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  medicineIcon: {
    fontSize: 23,
  },
  medicineHeading: {
    flex: 1,
    marginLeft: 12,
  },
  medicineName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#54313D",
  },
  medicineDosage: {
    fontSize: 13,
    color: "#9A7480",
    marginTop: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1E1E6",
    marginVertical: 14,
  },
  detailText: {
    fontSize: 13,
    color: "#765762",
    marginBottom: 8,
  },
  notesBox: {
    backgroundColor: "#FFF7F9",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8F5369",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#765762",
  },
  disclaimer: {
    flexDirection: "row",
    backgroundColor: "#F8F1F3",
    borderRadius: 14,
    padding: 13,
    marginTop: 10,
  },
  disclaimerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#8A7078",
  },
});