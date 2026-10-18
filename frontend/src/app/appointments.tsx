
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
import * as SecureStore from "expo-secure-store";

import {
  createAppointment,
  getAppointments,
  deleteAppointment as deleteAppointmentAPI,
} from "../../services/api";

import {
  scheduleAppointmentReminder,
  cancelAppointmentVaccinationReminder,
} from "../utils/appointmentVaccinationNotifications";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Appointment = {
  _id: string;
  doctorName: string;
  clinic: string;
  date: string;
  time: string;
  type: string;
  notes: string;
};

const formatDate = (value: string) => {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function Appointments() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [doctorName, setDoctorName] = useState("");
  const [clinic, setClinic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load appointments from the backend.
  const loadAppointments = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert(
          "Login Required",
          "Please login again to view your appointments."
        );
        return;
      }

      const response = await getAppointments(token);

      console.log("Appointments response:", response);

      if (response.success) {
        setAppointments(response.appointments || []);
      } else {
        Alert.alert(
          "Unable to Load",
          response.message || "Could not load appointments."
        );
      }
    } catch (error) {
      console.error("Load appointments error:", error);

      Alert.alert(
        "Error",
        "Something went wrong while loading appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Save appointment and schedule a phone reminder.
  const saveAppointment = async () => {
    if (!doctorName.trim() || !date.trim() || !time.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter the doctor name, date and time."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session was not found. Please login again."
        );
        return;
      }

      // Validate the date entered as DD-MM-YYYY.
      const dateParts = date.trim().split("-");

      if (
        dateParts.length !== 3 ||
        !/^\d{2}-\d{2}-\d{4}$/.test(date.trim())
      ) {
        Alert.alert(
          "Invalid Date",
          "Please enter the date as DD-MM-YYYY, for example 25-12-2026."
        );
        return;
      }

      const [day, month, year] = dateParts;

      const parsedDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      if (
        parsedDate.getFullYear() !== Number(year) ||
        parsedDate.getMonth() !== Number(month) - 1 ||
        parsedDate.getDate() !== Number(day)
      ) {
        Alert.alert(
          "Invalid Date",
          "Please enter a valid calendar date."
        );
        return;
      }

      // Store the date in YYYY-MM-DD format in the backend.
      const backendDate = `${year}-${month}-${day}`;

      const appointmentData = {
        doctorName: doctorName.trim(),
        clinic: clinic.trim(),
        date: backendDate,
        time: time.trim(),
        type: type.trim(),
        notes: notes.trim(),
      };

      const response = await createAppointment(
        token,
        appointmentData
      );

      console.log("Save appointment response:", response);

      if (response.success && response.appointment) {
        const savedAppointment: Appointment = response.appointment;

        setAppointments((previous) => [
          ...previous,
          savedAppointment,
        ]);

        // Schedule the phone reminder after the appointment is saved.
        try {
          await scheduleAppointmentReminder(savedAppointment);
        } catch (reminderError) {
          console.error(
            "Appointment reminder scheduling error:",
            reminderError
          );
        }

        setDoctorName("");
        setClinic("");
        setDate("");
        setTime("");
        setType("");
        setNotes("");
        setShowForm(false);

        Alert.alert(
          "Appointment Saved 💗",
          "Your appointment has been added successfully. If notifications are permitted and the appointment time is valid, a phone reminder will be scheduled."
        );
      } else {
        Alert.alert(
          "Unable to Save",
          response.message || "Could not save appointment."
        );
      }
    } catch (error) {
      console.error("Save appointment error:", error);

      Alert.alert(
        "Error",
        "Something went wrong while saving the appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete appointment and cancel its scheduled phone reminder.
  const deleteAppointment = (id: string) => {
    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to delete this appointment?",
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
                Alert.alert(
                  "Login Required",
                  "Please login again."
                );
                return;
              }

              const response = await deleteAppointmentAPI(token, id);

              console.log("Delete appointment response:", response);

              if (response.success) {
                setAppointments((previous) =>
                  previous.filter(
                    (appointment) => appointment._id !== id
                  )
                );

                // Cancel the reminder belonging to this appointment.
                try {
                  await cancelAppointmentVaccinationReminder(
                    `appointment:${id}`
                  );
                } catch (reminderError) {
                  console.error(
                    "Appointment reminder cancellation error:",
                    reminderError
                  );
                }

                Alert.alert(
                  "Deleted",
                  "Appointment deleted successfully."
                );
              } else {
                Alert.alert(
                  "Unable to Delete",
                  response.message || "Could not delete appointment."
                );
              }
            } catch (error) {
              console.error("Delete appointment error:", error);

              Alert.alert(
                "Error",
                "Something went wrong while deleting the appointment."
              );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{t.appointmentsTitle}</Text>
            <Text style={styles.subtitle}>
              {t.appointmentsSubtitle}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>💗</Text>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>{t.appName}</Text>
            <Text style={styles.introText}>
              {t.appointmentsSubtitle}
            </Text>
          </View>
        </View>

        {/* Add Appointment Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonIcon}>
            {showForm ? "−" : "+"}
          </Text>

          <Text style={styles.addButtonText}>
            {showForm ? t.close : t.addAppointment}
          </Text>
        </TouchableOpacity>

        {/* Appointment Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t.addAppointment}</Text>

            <Text style={styles.label}>{t.doctorName} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t.doctorName}
              placeholderTextColor="#B79BA5"
              value={doctorName}
              onChangeText={setDoctorName}
            />

            <Text style={styles.label}>{t.hospitalClinic}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.hospitalClinic}
              placeholderTextColor="#B79BA5"
              value={clinic}
              onChangeText={setClinic}
            />

            <Text style={styles.label}>{t.appointmentDate} *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#B79BA5"
              value={date}
              onChangeText={setDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.label}>{t.appointmentTime} *</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: 10:30 AM"
              placeholderTextColor="#B79BA5"
              value={time}
              onChangeText={setTime}
            />

            <Text style={styles.label}>{t.appointmentType}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.appointmentType}
              placeholderTextColor="#B79BA5"
              value={type}
              onChangeText={setType}
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
              onPress={saveAppointment}
              disabled={saving}
            >
              {saving ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t.loading}</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>
                  {t.saveAppointment} 💗
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Appointment History */}
        <Text style={styles.historyTitle}>{t.appointments}</Text>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#B86D84" />
            <Text style={styles.loadingText}>
              {t.loading}
            </Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={styles.emptyTitle}>{t.noAppointments}</Text>
            <Text style={styles.emptyText}>
              {t.noAppointmentsDesc}
            </Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <View
              key={appointment._id}
              style={styles.appointmentCard}
            >
              <View style={styles.appointmentTop}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateText}>
                    {formatDate(appointment.date)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAppointment(appointment._id)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <Text style={styles.doctorName}>
                Dr. {appointment.doctorName}
              </Text>

              {appointment.clinic ? (
                <Text style={styles.detailText}>
                  🏥 {appointment.clinic}
                </Text>
              ) : null}

              <Text style={styles.detailText}>
                🕐 {appointment.time}
              </Text>

              {appointment.type ? (
                <Text style={styles.detailText}>
                  📋 {appointment.type}
                </Text>
              ) : null}

              {appointment.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>
                    {appointment.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        {/* Disclaimer */}
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
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#54313D",
  },
  subtitle: {
    fontSize: 13,
    color: "#9A7480",
    marginTop: 3,
  },
  headerIcon: {
    fontSize: 30,
  },
  introCard: {
    flexDirection: "row",
    backgroundColor: "#FBE8EE",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  introIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#633B49",
    marginBottom: 5,
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7E5C67",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B86D84",
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 20,
  },
  addButtonIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    marginRight: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
  saveButton: {
    backgroundColor: "#D994A8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#54313D",
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1D9E1",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#9A7480",
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
  emptyText: {
    fontSize: 13,
    color: "#9A7480",
    textAlign: "center",
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1D9E1",
  },
  appointmentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBE8EE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateIcon: {
    fontSize: 17,
    marginRight: 7,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#704957",
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 17,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1E1E6",
    marginVertical: 14,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#54313D",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#765762",
    marginBottom: 6,
  },
  notesBox: {
    backgroundColor: "#FFF7F9",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  notesTitle: {
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
