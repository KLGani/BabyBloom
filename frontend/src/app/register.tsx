import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

import { registerUser } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

export default function RegisterScreen() {
  const { language, t } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert(t.error, "Please fill in all required fields.");
      return;
    }

    if (phone.length < 10) {
      Alert.alert(t.error, "Please enter a valid phone number.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.error, "Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.error, "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        language: language,
        mode: "pregnancy",
        pregnancyWeek: null,
      });

      if (!result.success) {
        Alert.alert(t.error, result.message || "Registration failed");
        return;
      }

      if (!result.token || !result.user) {
        Alert.alert(
          t.error,
          "Your account was created, but we could not start your session. Please sign in."
        );
        return;
      }

      await SecureStore.setItemAsync("authToken", result.token);
      await SecureStore.setItemAsync("user", JSON.stringify(result.user));
      router.replace("/mode-selection");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        t.error,
        "Your account may have been created, but we could not save your session. Please try signing in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNav}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>‹ {t.back}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langPill}
              onPress={() => setShowLangModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.langPillText}>🌐 {language} ▾</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoCircle}>
            <Text style={styles.logo}>🌸</Text>
          </View>

          <Text style={styles.title}>{t.createAccount}</Text>
          <Text style={styles.subtitle}>{t.createAccountSubtitle}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.yourDetails}</Text>

            <Text style={styles.label}>{t.fullName}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>{t.phoneNumber}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>{t.password}</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>{t.confirmPassword}</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t.createMyAccount}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>{t.alreadyHaveAccount}</Text>
              <TouchableOpacity onPress={() => router.replace("/")}>
                <Text style={styles.loginLink}> {t.signIn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>{t.registerTagline}</Text>

          <LanguageSelectorModal
            visible={showLangModal}
            onClose={() => setShowLangModal(false)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF7FA",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FCECEF",
    borderRadius: 12,
  },
  backText: {
    fontSize: 15,
    color: "#A65378",
    fontWeight: "700",
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
    color: "#A65378",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F8DDE8",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  logo: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8B4A68",
    textAlign: "center",
    marginTop: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E4CBD5",
    borderRadius: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#FFFCFD",
    marginBottom: 15,
  },
  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#B86B8A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  loginText: {
    color: "#777",
    fontSize: 14,
  },
  loginLink: {
    color: "#A65378",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 22,
  },
});