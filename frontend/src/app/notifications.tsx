
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { goBackOrReplace } from "../utils/navigation";
import * as SecureStore from "../utils/storage";

import {
  getAppointments,
  getVaccinations,
  getMedicines,
} from "../../services/api";

import {
  scheduleAppointmentReminder,
  scheduleVaccinationReminder,
} from "../utils/appointmentVaccinationNotifications";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Medicine = {
  _id?: string;
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[] | string;
};

type Appointment = {
  _id: string;
  doctorName: string;
  clinic?: string;
  date: string;
  time: string;
  type?: string;
};

type Vaccination = {
  _id: string;
  name: string;
  description?: string;
  date: string;
  completed: boolean;
  mode?: "pregnancy" | "child";
};

const formatDate = (value?: string) => {
  if (!value) return "Date not available";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match
    ? `${match[3]}-${match[2]}-${match[1]}`
    : value;
};

export default function NotificationsScreen() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadNotifications = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
          const token = await SecureStore.getItemAsync("authToken");

          if (!token) {
            if (active) {
              setErrorMessage("Please log in to view your reminders.");
              setAppointments([]);
              setVaccinations([]);
              setMedicines([]);
            }
            return;
          }

          const [appointmentResponse, vaccinationResponse, medicineResponse] =
            await Promise.all([
              getAppointments(token),
              getVaccinations(token),
              getMedicines(token),
            ]);

          if (!appointmentResponse.success) {
            throw new Error(
              appointmentResponse.message ||
                "Unable to load appointments."
            );
          }

          if (!vaccinationResponse.success) {
            throw new Error(
              vaccinationResponse.message ||
                "Unable to load vaccinations."
            );
          }

          const appointmentRecords: Appointment[] =
            appointmentResponse.appointments || [];

          const vaccinationRecords: Vaccination[] =
            vaccinationResponse.vaccinations || [];

          const medicineRecords: Medicine[] =
            medicineResponse && medicineResponse.success && Array.isArray(medicineResponse.medicines)
              ? medicineResponse.medicines
              : [];

          if (active) {
            setAppointments(appointmentRecords);
            setVaccinations(vaccinationRecords);
            setMedicines(medicineRecords);
          }

          // Restore reminders for saved appointments.
          for (const appointment of appointmentRecords) {
            try {
              await scheduleAppointmentReminder(appointment);
            } catch (error) {
              console.error(
                "Appointment reminder error:",
                error
              );
            }
          }

          // Restore reminders for saved, incomplete vaccinations.
          for (const vaccination of vaccinationRecords) {
            try {
              await scheduleVaccinationReminder(vaccination);
            } catch (error) {
              console.error(
                "Vaccination reminder error:",
                error
              );
            }
          }
        } catch (error) {
          console.error("Load notifications error:", error);

          if (active) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to load your reminders."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadNotifications();

      return () => {
        active = false;
      };
    }, [])
  );

  const refreshNotifications = () => {
    router.replace("/notifications");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goBackOrReplace()}
          >
            <Text style={styles.backText}>‹ {t.back}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>
          {t.appName.toUpperCase()}
        </Text>

        <Text style={styles.title}>
          {t.notificationsTitle}
        </Text>

        <Text style={styles.subtitle}>
          {t.notificationsSubtitle}
        </Text>

        {loading ? (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color="#B17C91" />
            <Text style={styles.statusText}>
              {t.loading}
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.statusCard}>
            <Text style={styles.emoji}>🌸</Text>
            <Text style={styles.cardTitle}>
              {t.error}
            </Text>
            <Text style={styles.description}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refreshNotifications}
            >
              <Text style={styles.retryText}>{t.confirm}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 1. PREGNANCY MEDICINE REMINDERS */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.emoji}>💊</Text>
                <TouchableOpacity onPress={() => router.push("/medicines")}>
                  <Text style={styles.cardActionLink}>{t.edit} →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>
                {t.medicinesTitle}
              </Text>

              {medicines.length === 0 ? (
                <Text style={styles.description}>
                  {t.noMedicinesDesc}
                </Text>
              ) : (
                medicines.map((med, idx) => {
                  const timesArr = Array.isArray(med.times)
                    ? med.times
                    : typeof med.times === "string"
                    ? (med.times as string).split(",")
                    : [];
                  return (
                    <View
                      key={med._id || med.id || idx}
                      style={styles.record}
                    >
                      <Text style={styles.recordTitle}>
                        {med.name} {med.dosage ? `(${med.dosage})` : ""}
                      </Text>

                      <Text style={styles.recordTime}>
                        ⏰ {med.frequency} • {timesArr.join(", ")}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>

            {/* 2. DOCTOR APPOINTMENTS (PREGNANCY & CHILD) */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.emoji}>🩺</Text>
                <TouchableOpacity onPress={() => router.push("/appointments")}>
                  <Text style={styles.cardActionLink}>{t.edit} →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>
                {t.appointmentsTitle}
              </Text>

              {appointments.length === 0 ? (
                <Text style={styles.description}>
                  {t.noAppointmentsDesc}
                </Text>
              ) : (
                appointments.map((appointment) => (
                  <View
                    key={appointment._id}
                    style={styles.record}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.recordTitle}>
                        {appointment.doctorName || t.appointments}
                      </Text>
                      {!!appointment.type && (
                        <Text style={styles.typeBadge}>{appointment.type}</Text>
                      )}
                    </View>

                    {!!appointment.clinic && (
                      <Text style={styles.description}>
                        🏥 {appointment.clinic}
                      </Text>
                    )}

                    <Text style={styles.recordDate}>
                      📅 {formatDate(appointment.date)}
                    </Text>

                    {!!appointment.time && (
                      <Text style={styles.recordTime}>
                        🕒 {appointment.time}
                      </Text>
                    )}
                  </View>
                ))
              )}

              <Text style={styles.helperText}>
                {t.appointmentsSubtitle}
              </Text>
            </View>

            {/* 3. CHILD VACCINATION REMINDERS */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.emoji}>🧸</Text>
                <TouchableOpacity onPress={() => router.push("/vaccination")}>
                  <Text style={styles.cardActionLink}>{t.edit} →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardTitle}>
                {t.vaccination}
              </Text>

              {vaccinations.filter((vaccine) => vaccine.mode !== "pregnancy" && !vaccine.completed)
                .length === 0 ? (
                <Text style={styles.description}>
                  {t.noNotificationsDesc}
                </Text>
              ) : (
                vaccinations
                  .filter((vaccine) => vaccine.mode !== "pregnancy" && !vaccine.completed)
                  .map((vaccine) => (
                    <View
                      key={vaccine._id}
                      style={styles.record}
                    >
                      <Text style={styles.recordTitle}>
                        {vaccine.name}
                      </Text>

                      {!!vaccine.description && (
                        <Text style={styles.description}>
                          {vaccine.description}
                        </Text>
                      )}

                      <Text style={styles.recordDate}>
                        📅 Due: {formatDate(vaccine.date)}
                      </Text>

                      <Text style={styles.pendingLabel}>
                        {t.vaccination}
                      </Text>
                    </View>
                  ))
              )}

              <Text style={styles.helperText}>
                {t.permissionNotificationsDesc}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          {t.tagline} 💗
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
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F8",
  },
  container: {
    padding: 22,
    paddingBottom: 35,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B17C91",
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
  eyebrow: {
    color: "#B17C91",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#563D50",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#897784",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3E7EC",
  },
  emoji: {
    fontSize: 27,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardActionLink: {
    color: "#B17C91",
    fontSize: 12,
    fontWeight: "800",
  },
  cardTitle: {
    color: "#563D50",
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: "#8D7A86",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  record: {
    backgroundColor: "#FFF8FA",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F3E7EC",
    padding: 13,
    marginTop: 13,
  },
  recordTitle: {
    color: "#563D50",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  typeBadge: {
    backgroundColor: "#FCECEF",
    color: "#A95772",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  recordDate: {
    color: "#A95772",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
  },
  recordTime: {
    color: "#897784",
    fontSize: 12,
    marginTop: 5,
  },
  pendingLabel: {
    color: "#A95772",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  helperText: {
    color: "#9A8590",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3E7EC",
  },
  statusText: {
    color: "#897784",
    fontSize: 13,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: "#B17C91",
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#AE8A9C",
    fontSize: 13,
    marginTop: 16,
  },
});
