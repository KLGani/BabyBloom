import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  createVaccination,
  deleteVaccination,
  getVaccinations,
  updateVaccination,
} from "../../services/api";
import {
  cancelAppointmentVaccinationReminder,
  scheduleVaccinationReminder,
} from "../utils/appointmentVaccinationNotifications";
import { useLanguage, AVAILABLE_LANGUAGES } from "../context/LanguageContext";
import { LanguageSelectorModal } from "../components/LanguageSelectorModal";

type Vaccination = {
  _id: string;
  name: string;
  description?: string;
  date: string;
  completed: boolean;
  mode?: "pregnancy" | "child";
};

type Mode = "pregnancy" | "child";

const PREGNANCY_VACCINES_INFO = [
  {
    name: "Influenza (Flu)",
    timing: "Any trimester during flu season",
    reason:
      "Protects pregnant women against severe flu illness and passes maternal antibodies to protect the baby during their first 6 months of life.",
    badge: "Seasonal / Annual",
  },
  {
    name: "Tdap (Tetanus, Diphtheria, Pertussis)",
    timing: "Between weeks 27 and 36 of each pregnancy",
    reason:
      "Critically transfers high levels of protective antibodies against whooping cough (pertussis) to your newborn before they can receive their own vaccines.",
    badge: "Third Trimester",
  },
];

const COMMON_CHILD_VACCINES = [
  "BCG",
  "Hepatitis B",
  "OPV (Polio)",
  "DTaP",
  "Rotavirus",
  "Hib",
  "PCV",
  "MMR",
];

export default function VaccinationScreen() {
  const [activeTab, setActiveTab] = useState<Mode>("pregnancy");
  const [pregnancyVaccines, setPregnancyVaccines] = useState<Vaccination[]>([]);
  const [childVaccines, setChildVaccines] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  // Child form states
  const [childName, setChildName] = useState("");
  const [childDate, setChildDate] = useState("");
  const [childNotes, setChildNotes] = useState("");
  const [savingChild, setSavingChild] = useState(false);

  // Pregnancy date input states
  const [pregFluDate, setPregFluDate] = useState("");
  const [pregTdapDate, setPregTdapDate] = useState("");
  const [savingPreg, setSavingPreg] = useState(false);

  const { t, language } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [token, storedUser] = await Promise.all([
        SecureStore.getItemAsync("authToken"),
        SecureStore.getItemAsync("user"),
      ]);

      if (!token) {
        router.replace("/");
        return;
      }

      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.mode === "child") {
          setActiveTab("child");
        } else {
          setActiveTab("pregnancy");
        }
      }

      const result = await getVaccinations(token);
      if (result.success && Array.isArray(result.vaccinations)) {
        const all: Vaccination[] = result.vaccinations;
        const pList = all.filter((v) => v.mode === "pregnancy");
        const cList = all.filter((v) => v.mode !== "pregnancy");

        setPregnancyVaccines(pList);
        setChildVaccines(cList);

        const flu = pList.find((v) => v.name.includes("Influenza"));
        if (flu) setPregFluDate(formatDisplayDate(flu.date));

        const tdap = pList.find((v) => v.name.includes("Tdap"));
        if (tdap) setPregTdapDate(formatDisplayDate(tdap.date));

        for (const item of cList) {
          if (!item.completed) {
            await scheduleVaccinationReminder(item);
          }
        }
      }
    } catch (err) {
      console.error("Error loading vaccinations:", err);
      Alert.alert("Error", "Could not load vaccination records.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle pregnancy vaccine (Influenza or Tdap)
  const saveOrTogglePregnancyVaccine = async (vName: string, dateInput: string) => {
    try {
      setSavingPreg(true);
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }

      let dateToSend = "";
      if (dateInput.trim()) {
        const match = dateInput.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (match) {
          dateToSend = `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
      if (!dateToSend) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d = String(now.getDate()).padStart(2, "0");
        dateToSend = `${y}-${m}-${d}`;
      }

      const existing = pregnancyVaccines.find((v) => v.name === vName);

      if (existing) {
        // Toggle completion
        const res = await updateVaccination(token, existing._id, !existing.completed);
        if (res.success && res.vaccination) {
          setPregnancyVaccines((prev) =>
            prev.map((v) => (v._id === existing._id ? res.vaccination : v))
          );
        }
      } else {
        // Create new
        const res = await createVaccination(token, {
          name: vName,
          description: vName.includes("Tdap")
            ? "Maternal Tdap booster (27-36 weeks)"
            : "Maternal Influenza vaccine",
          date: dateToSend,
          mode: "pregnancy",
        });
        if (res.success && res.vaccination) {
          // By default, mark as completed if saving
          const updatedRes = await updateVaccination(token, res.vaccination._id, true);
          const finalItem = updatedRes.success ? updatedRes.vaccination : res.vaccination;
          setPregnancyVaccines((prev) => [...prev, finalItem]);
          Alert.alert("Recorded 🌸", `${vName} vaccine recorded successfully!`);
        }
      }
    } catch {
      Alert.alert("Error", "Unable to update vaccine record.");
    } finally {
      setSavingPreg(false);
    }
  };

  // Child: Add custom vaccine reminder
  const addChildVaccineReminder = async () => {
    const cleanName = childName.trim();
    const match = childDate.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (!cleanName) {
      Alert.alert("Vaccine Name Required", "Please enter or pick a vaccine name.");
      return;
    }
    if (!match) {
      Alert.alert("Invalid Date", "Please enter the due date in DD-MM-YYYY format.");
      return;
    }

    const [, day, month, year] = match;
    const isoDate = `${year}-${month}-${day}`;

    setSavingChild(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }

      const res = await createVaccination(token, {
        name: cleanName,
        description: childNotes.trim(),
        date: isoDate,
        mode: "child",
      });

      if (res.success && res.vaccination) {
        const item: Vaccination = res.vaccination;
        setChildVaccines((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)));
        await scheduleVaccinationReminder(item);
        setChildName("");
        setChildDate("");
        setChildNotes("");
        Alert.alert(
          "Reminder Scheduled 🧸",
          `Child reminder for ${cleanName} saved! You'll receive an alert before the due date.`
        );
      } else {
        Alert.alert("Error", res.message || "Failed to save reminder.");
      }
    } catch {
      Alert.alert("Error", "Network error saving reminder.");
    } finally {
      setSavingChild(false);
    }
  };

  const toggleChildCompleted = async (item: Vaccination) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) return;

      const res = await updateVaccination(token, item._id, !item.completed);
      if (res.success && res.vaccination) {
        const updated = res.vaccination;
        setChildVaccines((prev) => prev.map((v) => (v._id === item._id ? updated : v)));
        if (updated.completed) {
          await cancelAppointmentVaccinationReminder(`vaccination:${updated._id}`);
        } else {
          await scheduleVaccinationReminder(updated);
        }
      }
    } catch {
      Alert.alert("Error", "Unable to update status.");
    }
  };

  const deleteChildItem = (item: Vaccination) => {
    Alert.alert("Delete Reminder?", `Remove ${item.name} from vaccine reminders?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const token = await SecureStore.getItemAsync("authToken");
          if (!token) return;
          const res = await deleteVaccination(token, item._id);
          if (res.success) {
            await cancelAppointmentVaccinationReminder(`vaccination:${item._id}`);
            setChildVaccines((prev) => prev.filter((v) => v._id !== item._id));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.vaccination} 💉</Text>
            <Text style={styles.headerSubtitle}>Maternal & Pediatric Immunization</Text>
          </View>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langPillText}>
              🌐 {AVAILABLE_LANGUAGES.find((l) => l.id === language)?.nativeLabel || language} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode switcher tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "pregnancy" && styles.tabBtnActive]}
            onPress={() => setActiveTab("pregnancy")}
          >
            <Text
              style={[styles.tabBtnText, activeTab === "pregnancy" && styles.tabBtnTextActive]}
            >
              🤰 {t.pregnancy}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "child" && styles.tabBtnActive]}
            onPress={() => setActiveTab("child")}
          >
            <Text style={[styles.tabBtnText, activeTab === "child" && styles.tabBtnTextActive]}>
              👶 {t.child}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#B86D84" style={{ marginVertical: 35 }} />
        ) : activeTab === "pregnancy" ? (
          /* =========================================================
             PREGNANCY VACCINATION TAB (ONLY Influenza and Tdap)
          ========================================================= */
          <View>
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerEmoji}>🌸</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoBannerTitle}>Pregnancy Vaccines</Text>
                <Text style={styles.infoBannerText}>
                  Medical guidelines strictly recommend only two routine vaccines during
                  pregnancy to protect you and your newborn: Influenza and Tdap.
                </Text>
              </View>
            </View>

            {PREGNANCY_VACCINES_INFO.map((info) => {
              const record = pregnancyVaccines.find(
                (v) =>
                  v.name.toLowerCase().includes(info.name.split(" ")[0].toLowerCase()) ||
                  v.name.toLowerCase().includes(info.name.toLowerCase())
              );
              const isCompleted = record?.completed ?? false;
              const dateVal = info.name.includes("Influenza") ? pregFluDate : pregTdapDate;
              const setDateVal = info.name.includes("Influenza") ? setPregFluDate : setPregTdapDate;

              return (
                <View key={info.name} style={styles.pregCard}>
                  <View style={styles.pregCardTop}>
                    <View style={styles.pregIconCircle}>
                      <Text style={styles.pregEmoji}>💉</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{info.badge}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusTag,
                            isCompleted ? styles.statusTagDone : styles.statusTagPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              isCompleted ? styles.statusTagTextDone : styles.statusTagTextPending,
                            ]}
                          >
                            {isCompleted ? "✓ Received" : "⏳ Pending"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.pregCardTitle}>{info.name}</Text>
                      <Text style={styles.timingText}>📅 {info.timing}</Text>
                    </View>
                  </View>

                  <Text style={styles.reasonText}>{info.reason}</Text>

                  {/* Date Input */}
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Date Administered / Scheduled:</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD-MM-YYYY"
                      placeholderTextColor="#9FA8A5"
                      value={dateVal}
                      onChangeText={setDateVal}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                  </View>

                  {/* Action button */}
                  <TouchableOpacity
                    style={[styles.toggleBtn, isCompleted && styles.toggleBtnDone]}
                    onPress={() => saveOrTogglePregnancyVaccine(info.name, dateVal)}
                    disabled={savingPreg}
                  >
                    <Text style={[styles.toggleBtnText, isCompleted && styles.toggleBtnTextDone]}>
                      {isCompleted ? "Mark as Pending" : "Mark as Received ✓"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.pregNoticeCard}>
              <Text style={styles.pregNoticeEmoji}>💡</Text>
              <Text style={styles.pregNoticeText}>
                No other vaccines should be taken during pregnancy unless specifically recommended
                by your obstetrician. Always consult your doctor prior to receiving any vaccination.
              </Text>
            </View>
          </View>
        ) : (
          /* =========================================================
             CHILD VACCINATION TAB (Vaccine Reminders)
          ========================================================= */
          <View>
            <View style={[styles.infoBanner, styles.childBanner]}>
              <Text style={styles.infoBannerEmoji}>🧸</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoBannerTitle, styles.childTitleText]}>
                  Child Vaccine Reminders
                </Text>
                <Text style={[styles.infoBannerText, styles.childMutedText]}>
                  Schedule reminder alerts for your baby's immunizations based on your pediatric
                  vaccine card.
                </Text>
              </View>
            </View>

            {/* Quick add chips */}
            <Text style={styles.sectionHeader}>QUICK SELECT CHILD VACCINE</Text>
            <View style={styles.chipsRow}>
              {COMMON_CHILD_VACCINES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, childName === v && styles.chipActive]}
                  onPress={() => setChildName(v)}
                >
                  <Text style={[styles.chipText, childName === v && styles.chipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Add reminder form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add a Child Vaccine Reminder</Text>

              <Text style={styles.inputLabel}>VACCINE / DOSE NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="E.g., Hepatitis B, BCG, DTaP Dose 1"
                placeholderTextColor="#9EA5A3"
                value={childName}
                onChangeText={setChildName}
              />

              <Text style={styles.inputLabel}>DUE DATE (DD-MM-YYYY)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#9EA5A3"
                value={childDate}
                onChangeText={setChildDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />

              <Text style={styles.inputLabel}>CLINIC / NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder="Pediatric clinic, dosage, doctor instructions..."
                placeholderTextColor="#9EA5A3"
                value={childNotes}
                onChangeText={setChildNotes}
                multiline
                numberOfLines={2}
              />

              <TouchableOpacity
                style={[styles.saveReminderBtn, savingChild && { opacity: 0.6 }]}
                onPress={addChildVaccineReminder}
                disabled={savingChild}
              >
                {savingChild ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveReminderBtnText}>Save Vaccine Reminder 🔔</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* List of saved child reminders */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionHeader}>SAVED VACCINE REMINDERS</Text>
              <Text style={styles.countText}>
                {childVaccines.filter((v) => v.completed).length} of {childVaccines.length} completed
              </Text>
            </View>

            {childVaccines.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🧸</Text>
                <Text style={styles.emptyTitle}>No child reminders yet</Text>
                <Text style={styles.emptyText}>
                  Add vaccine due dates from your baby's health card above to receive phone reminders.
                </Text>
              </View>
            ) : (
              childVaccines.map((item) => (
                <View key={item._id} style={styles.childCard}>
                  <View style={styles.childCardTop}>
                    <View style={styles.childIconCircle}>
                      <Text style={styles.childEmoji}>💉</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.childCardTitle}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.childCardDesc}>{item.description}</Text>
                      ) : null}
                      <Text style={styles.childCardDate}>📅 Due: {formatDisplayDate(item.date)}</Text>
                    </View>
                  </View>

                  <View style={styles.childCardActions}>
                    <TouchableOpacity
                      style={[
                        styles.childStatusBtn,
                        item.completed && styles.childStatusBtnDone,
                      ]}
                      onPress={() => toggleChildCompleted(item)}
                    >
                      <Text
                        style={[
                          styles.childStatusText,
                          item.completed && styles.childStatusTextDone,
                        ]}
                      >
                        {item.completed ? "✓ Completed" : "Mark as Received"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deleteChildItem(item)}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function formatDisplayDate(iso: string) {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return iso;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8FA" },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#593341" },
  headerSubtitle: { fontSize: 11, color: "#947682", marginTop: 2 },
  langPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E6B8C7",
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8B475D",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FCECEF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#B86D84",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBtnText: { fontSize: 12, fontWeight: "800", color: "#8E5F70" },
  tabBtnTextActive: { color: "#B86D84" },

  infoBanner: {
    backgroundColor: "#FFEAF0",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F7D1DC",
  },
  childBanner: {
    backgroundColor: "#E4F3EE",
    borderColor: "#CCE5DD",
  },
  infoBannerEmoji: { fontSize: 32, marginRight: 14 },
  infoBannerTitle: { fontSize: 15, fontWeight: "900", color: "#542D3C" },
  childTitleText: { color: "#2B524A" },
  infoBannerText: { fontSize: 12, color: "#7B5060", marginTop: 2, lineHeight: 18 },
  childMutedText: { color: "#4E736B" },

  pregCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F7E6EC",
    elevation: 1,
  },
  pregCardTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  pregIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  pregEmoji: { fontSize: 24 },
  badgeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  badge: {
    backgroundColor: "#FCECEF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#9E566C" },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusTagDone: { backgroundColor: "#E3F3EA" },
  statusTagPending: { backgroundColor: "#FFF3E6" },
  statusTagText: { fontSize: 11, fontWeight: "900" },
  statusTagTextDone: { color: "#2E7D52" },
  statusTagTextPending: { color: "#B36717" },
  pregCardTitle: { fontSize: 17, fontWeight: "900", color: "#542D3C" },
  timingText: { fontSize: 12, color: "#9E6D7E", marginTop: 2, fontWeight: "700" },
  reasonText: { fontSize: 13, lineHeight: 19, color: "#6A535D", marginBottom: 14 },

  dateRow: { marginBottom: 14 },
  dateLabel: { fontSize: 11, fontWeight: "800", color: "#8E5F70", marginBottom: 6 },
  dateInput: {
    borderWidth: 1,
    borderColor: "#EED8E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: "#542D3C",
    backgroundColor: "#FFFDFC",
  },
  toggleBtn: {
    backgroundColor: "#B86D84",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  toggleBtnDone: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#9E566C",
  },
  toggleBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  toggleBtnTextDone: { color: "#9E566C" },

  pregNoticeCard: {
    backgroundColor: "#FFF7EE",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCE5D2",
    marginTop: 8,
  },
  pregNoticeEmoji: { fontSize: 24, marginRight: 12 },
  pregNoticeText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#7B5938" },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4C7C71",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 6,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D2E7DF",
  },
  chipActive: { backgroundColor: "#4C8D7F", borderColor: "#4C8D7F" },
  chipText: { fontSize: 12, fontWeight: "800", color: "#3B695E" },
  chipTextActive: { color: "#FFFFFF" },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DAEBE5",
  },
  formTitle: { fontSize: 16, fontWeight: "900", color: "#2B524A", marginBottom: 10 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4E7E73",
    letterSpacing: 1.1,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D5E7E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#2B524A",
    backgroundColor: "#FBFEFD",
  },
  notesInput: { minHeight: 55, textAlignVertical: "top" },
  saveReminderBtn: {
    backgroundColor: "#4C8D7F",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  saveReminderBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },

  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  countText: { fontSize: 11, fontWeight: "800", color: "#4E7E73" },

  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCECE6",
    elevation: 1,
  },
  childCardTop: { flexDirection: "row", alignItems: "flex-start" },
  childIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF6F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  childEmoji: { fontSize: 22 },
  childCardTitle: { fontSize: 15, fontWeight: "900", color: "#2B524A" },
  childCardDesc: { fontSize: 12, color: "#60847B", marginTop: 2 },
  childCardDate: { fontSize: 12, fontWeight: "800", color: "#4C8D7F", marginTop: 4 },
  childCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F7F4",
  },
  childStatusBtn: {
    borderWidth: 1,
    borderColor: "#4C8D7F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  childStatusBtnDone: { backgroundColor: "#E3F3EA", borderColor: "#7FB398" },
  childStatusText: { fontSize: 11, fontWeight: "800", color: "#4C8D7F" },
  childStatusTextDone: { color: "#2E7D52" },
  deleteText: { fontSize: 12, fontWeight: "800", color: "#BA6270", padding: 6 },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCECE6",
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: "900", color: "#2B524A" },
  emptyText: { fontSize: 12, color: "#6B8A83", textAlign: "center", marginTop: 4, lineHeight: 18 },
});
