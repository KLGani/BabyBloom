import React, { useState } from "react";
import {
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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "../utils/storage";

import { loginUser } from "../../services/api";
import { useLanguage, AVAILABLE_LANGUAGES } from "../context/LanguageContext";
import { LanguageSelectorModal } from "../components/LanguageSelectorModal";

export default function LoginScreen() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t.error || "Missing information", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email.trim(), password);

      if (!result.success) {
        Alert.alert(t.error || "Login failed", result.message);
        return;
      }

      if (!result.token || !result.user) {
        Alert.alert(t.error || "Login failed", "The server returned an invalid session.");
        return;
      }

      await SecureStore.setItemAsync("authToken", result.token);
      await SecureStore.setItemAsync("user", JSON.stringify(result.user));

      router.replace("/mode-selection");
    } catch (error) {
      console.error("Login session error:", error);
      Alert.alert(
        t.error || "Login error",
        "We could not save your login session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentNativeLabel =
    AVAILABLE_LANGUAGES.find((l) => l.id === language)?.nativeLabel || language;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Language Toggle */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.langTogglePill}
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.langToggleIcon}>🌐</Text>
              <Text style={styles.langToggleText}>{currentNativeLabel} ▾</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🌸</Text>
          </View>

          <Text style={styles.title}>{t.appName || "Little Bloom"}</Text>

          <Text style={styles.subtitle}>
            {t.tagline || "Your smart companion for\nmother & child"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back 💕</Text>

            <Text style={styles.description}>
              Sign in to continue your Little Bloom journey.
            </Text>

            <Text style={styles.label}>Email</Text>

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

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerLink}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            🌿 Caring for every little bloom
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF7FA",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },

  langTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E6B8C7",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  langToggleIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  langToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8B475D",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F8DDE8",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  logoText: {
    fontSize: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#8B4A68",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 6,
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  welcome: {
    fontSize: 23,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#777",
    lineHeight: 21,
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E4CBD5",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#333",
    marginBottom: 16,
    backgroundColor: "#FFFCFD",
  },

  loginButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#B86B8A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
    flexWrap: "wrap",
  },

  registerText: {
    color: "#777",
    fontSize: 14,
  },

  registerLink: {
    color: "#A65378",
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 24,
  },
});