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
import { getChildProfile, updateChildProfile } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

export default function GrowthScreen() {
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }
      const result = await getChildProfile(token);
      if (result.success && result.profile) {
        setHeight(
          result.profile.height == null ? "" : String(result.profile.height)
        );
        setWeight(
          result.profile.weight == null ? "" : String(result.profile.weight)
        );
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const h = height.trim() ? Number(height) : null;
    const w = weight.trim() ? Number(weight) : null;
    if (
      (h !== null && (!Number.isFinite(h) || h <= 0)) ||
      (w !== null && (!Number.isFinite(w) || w <= 0))
    ) {
      Alert.alert(t.checkMeasurements, t.enterValidMeasurements);
      return;
    }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }
      const current = await getChildProfile(token);
      if (!current.success) {
        Alert.alert(t.error, current.message || "Please try again.");
        return;
      }
      const result = await updateChildProfile(token, {
        ...current.profile,
        height: h,
        weight: w,
      });
      if (result.success) {
        Alert.alert(t.growthUpdated, t.growthSaved);
        router.back();
      } else {
        Alert.alert(t.error, result.message || "Please try again.");
      }
    } catch {
      Alert.alert(t.error, "Could not save these measurements.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topNav}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={s.backText}>‹ {t.back}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.langPill}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.8}
          >
            <Text style={s.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.title}>{t.growthTracker}</Text>
        <Text style={s.sub}>{t.recordMeasurements}</Text>

        {loading ? (
          <ActivityIndicator color="#4F9588" size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={s.card}>
            <Text style={s.label}>{t.height}</Text>
            <TextInput
              style={s.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 72"
              placeholderTextColor="#9CB3AE"
            />

            <Text style={s.label}>{t.weight}</Text>
            <TextInput
              style={s.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 8.2"
              placeholderTextColor="#9CB3AE"
            />

            <Text style={s.note}>{t.growthNote}</Text>

            <TouchableOpacity
              style={s.button}
              onPress={save}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={s.buttonText}>{t.saveMeasurements}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <LanguageSelectorModal
          visible={showLangModal}
          onClose={() => setShowLangModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F5FBFA" },
  content: { padding: 22, paddingTop: 40, paddingBottom: 40 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#E2F2EE",
    borderRadius: 12,
  },
  backText: { color: "#4F8279", fontWeight: "700", fontSize: 15 },
  langPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCE5DF",
  },
  langPillText: { fontSize: 13, fontWeight: "700", color: "#3B7A70" },
  title: { fontSize: 28, fontWeight: "800", color: "#294F4A" },
  sub: { color: "#688F8A", marginTop: 6, marginBottom: 22, fontSize: 14 },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#4F9588",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontWeight: "700", color: "#315D57", marginTop: 12, marginBottom: 8, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#D5E8E3",
    borderRadius: 12,
    padding: 14,
    color: "#294F4A",
    marginBottom: 10,
    backgroundColor: "#FBFEFD",
    fontSize: 15,
  },
  note: { fontSize: 12, color: "#79938F", lineHeight: 18, marginVertical: 14 },
  button: {
    backgroundColor: "#72AFA3",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "800", fontSize: 15 },
});
