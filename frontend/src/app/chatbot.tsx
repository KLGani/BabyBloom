import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendChatMessage } from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: string;
};

type LanguageOption = {
  id: string;
  label: string;
  nativeLabel: string;
  placeholder: string;
  welcome: string;
  suggestedPrompts: string[];
};

const LANGUAGES: LanguageOption[] = [
  {
    id: "English",
    label: "English",
    nativeLabel: "English",
    placeholder: "Ask any pregnancy or childcare question...",
    welcome:
      "🌸 Hello! I'm your Little Bloom AI healthcare assistant. Ask me anything about your symptoms, safe foods, medications, or labor signs in English, Kannada, Hindi, Tamil, or Telugu!",
    suggestedPrompts: [
      "Can I take Paracetamol for headaches?",
      "Is it safe to eat pineapple or papaya?",
      "How to relieve lower back pain?",
      "What are early signs of labor?",
    ],
  },
  {
    id: "Kannada",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ",
    placeholder: "ಗರ್ಭಾವಸ್ಥೆಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ: ಬೆನ್ನು ನೋವು, ವಾಂತಿ)...",
    welcome:
      "🌸 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಲಿಟಲ್ ಬ್ಲೂಮ್ ಎಐ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಗರ್ಭಾವಸ್ಥೆಯ ಲಕ್ಷಣಗಳು, ಸುರಕ್ಷಿತ ಆಹಾರ, ಔಷಧಿಗಳು ಅಥವಾ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ, ನಾನು ಉತ್ತರಿಸುತ್ತೇನೆ!",
    suggestedPrompts: [
      "ಬೆನ್ನು ನೋವಿಗೆ ಏನು ಮಾಡಬೇಕು?",
      "ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಪಪ್ಪಾಯಿ ತಿನ್ನಬಹುದೇ?",
      "ವಾಂತಿ ಕಡಿಮೆ ಮಾಡಲು ಮನೆಮದ್ದು ತಿಳಿಸಿ",
      "ಮಗುವಿನ ಚಲನೆ ಯಾವಾಗ ತಿಳಿಯುತ್ತದೆ?",
    ],
  },
  {
    id: "Hindi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    placeholder: "गर्भावस्था या शिशु देखभाल से जुड़ा कोई भी सवाल पूछें...",
    welcome:
      "🌸 नमस्ते! मैं आपकी लिटिल ब्लूम एआई स्वास्थ्य सहायिका हूँ। गर्भावस्था के लक्षण, खान-पान, दवाइयों की सुरक्षा या शिशु देखभाल के बारे में कोई भी सवाल पूछें!",
    suggestedPrompts: [
      "गर्भावस्था में उल्टी कैसे रोकें?",
      "क्या प्रेगनेंसी में पपीता खा सकते हैं?",
      "कमर दर्द से राहत कैसे पाएं?",
      "बच्चे की हलचल कब शुरू होती है?",
    ],
  },
  {
    id: "Tamil",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    placeholder: "கர்ப்பம் அல்லது குழந்தை பராமரிப்பு பற்றிய கேள்விகளைக் கேளுங்கள்...",
    welcome:
      "🌸 வணக்கம்! நான் உங்கள் லிட்டில் ப்ளூம் தாய்மை நல உதவியாளர். கர்ப்ப கால அறிகுறிகள், உணவு முறை, பாதுகாப்பான மருந்துகள் பற்றி எதையும் கேளுங்கள்!",
    suggestedPrompts: [
      "முதுகு வலிக்கு என்ன செய்யலாம்?",
      "கர்ப்ப காலத்தில் பப்பாளி சாப்பிடலாமா?",
      "வாந்தி குமட்டலை குறைக்க வழிகள்",
      "குழந்தையின் அசைவு எப்போது தெரியும்?",
    ],
  },
  {
    id: "Telugu",
    label: "Telugu",
    nativeLabel: "తెలుగు",
    placeholder: "గర్భధారణ లేదా బిడ్డ సంరక్షణ గురించి ఏదైనా ప్రశ్న అడగండి...",
    welcome:
      "🌸 నమస్కారం! నేను మీ లిటిల్ బ్లూమ్ ఏఐ ఆరోగ్య సహాయకురాలిని. గర్భధారణ లక్షణాలు, సురక్షిత ఆహారం, మందులు లేదా ప్రసవ సంకేతాల గురించి అడగండి!",
    suggestedPrompts: [
      "వాంతులు తగ్గడానికి ఏం చేయాలి?",
      "గర్భధారణలో బొప్పాయి తినవచ్చా?",
      "వెన్నునొప్పి నివారణ చిట్కాలు",
      "బిడ్డ కదలికలు ఎప్పుడు తెలుస్తాయి?",
    ],
  },
];

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage();

  const [selectedLangId, setSelectedLangId] = useState<string>(globalLanguage || "English");
  const activeLang = LANGUAGES.find((l) => l.id === selectedLangId) || LANGUAGES[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: activeLang.welcome,
      timestamp: new Date(),
      language: activeLang.id,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Keyboard adjustment state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Keyboard event listeners (Native & Web)
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    // Mobile web visualViewport resize listener
    const handleViewportResize = () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        const isShrunk = window.visualViewport.height < window.innerHeight - 150;
        setKeyboardVisible(isShrunk);
        if (isShrunk) {
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
      }
    };
  }, []);

  // Sync when globalLanguage changes
  useEffect(() => {
    if (globalLanguage && globalLanguage !== selectedLangId) {
      const target = LANGUAGES.find((l) => l.id === globalLanguage);
      if (target) {
        setSelectedLangId(target.id);
        if (messages.length <= 1) {
          setMessages([
            {
              id: "initial-" + target.id,
              role: "assistant",
              content: target.welcome,
              timestamp: new Date(),
              language: target.id,
            },
          ]);
        }
      }
    }
  }, [globalLanguage]);

  // Update welcome message when language changes if chat is fresh
  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLangId(lang.id);
    setGlobalLanguage(lang.id as SupportedLanguage);
    if (messages.length <= 1) {
      setMessages([
        {
          id: "initial-" + lang.id,
          role: "assistant",
          content: lang.welcome,
          timestamp: new Date(),
          language: lang.id,
        },
      ]);
    }
  };

  // Send message
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    try {
      const token = await SecureStore.getItemAsync("authToken");
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(
        text,
        activeLang.id,
        token || undefined,
        historyPayload
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          res.reply ||
          res.message ||
          "I am here with you. Please feel free to ask another question.",
        timestamp: new Date(),
        language: res.detectedLanguage || activeLang.id,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I am having trouble connecting right now. Please try again shortly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
            ? "height"
            : undefined
        }
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Little Bloom AI 🤖</Text>
            <Text style={styles.headerSubtitle}>
              Maternal & Childcare AI Companion ({activeLang.nativeLabel})
            </Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* 5 Natural Languages Selector */}
        <View style={styles.languageContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageScroll}
          >
            {LANGUAGES.map((lang) => {
              const isSelected = lang.id === selectedLangId;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.langChip,
                    isSelected && styles.langChipSelected,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.langChipNative,
                      isSelected && styles.langChipNativeSelected,
                    ]}
                  >
                    {lang.nativeLabel}
                  </Text>
                  <Text
                    style={[
                      styles.langChipSub,
                      isSelected && styles.langChipSubSelected,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageContent,
            { paddingBottom: keyboardVisible ? 20 : 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <View
                key={m.id}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.botBubble,
                ]}
              >
                {!isUser && (
                  <View style={styles.botTagRow}>
                    <Text style={styles.botTagText}>🌸 Little Bloom AI</Text>
                    {!!m.language && m.language !== "English" && (
                      <View style={styles.langBadge}>
                        <Text style={styles.langBadgeText}>{m.language}</Text>
                      </View>
                    )}
                  </View>
                )}

                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.botText,
                  ]}
                >
                  {m.content}
                </Text>
              </View>
            );
          })}

          {loading && (
            <View
              style={[
                styles.messageBubble,
                styles.botBubble,
                styles.loadingBubble,
              ]}
            >
              <ActivityIndicator color="#B86D84" size="small" />
              <Text style={styles.thinkingText}>
                Little Bloom AI is thinking in {activeLang.label}...
              </Text>
            </View>
          )}

          {/* Suggested Prompts in Active Language */}
          {messages.length <= 2 && (
            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>
                💡 Suggested questions in {activeLang.nativeLabel}:
              </Text>
              {activeLang.suggestedPrompts.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Medical disclaimer note */}
        <View style={styles.disclaimerBar}>
          <Text style={styles.disclaimerText}>
            ℹ️ AI answers are for informational guidance and do not replace professional medical advice.
          </Text>
        </View>

        {/* Input bar pinned above keyboard */}
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: keyboardVisible
                ? 10
                : Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.inputWrapper}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              style={styles.inputField}
              placeholder={activeLang.placeholder}
              placeholderTextColor="#A78B95"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
            />
            {input.length > 0 && (
              <TouchableOpacity
                onPress={() => setInput("")}
                style={styles.clearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>➔</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8FA" },
  keyboardContainer: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F7E6EC",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FCECEF",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 26,
    color: "#B86D84",
    fontWeight: "bold",
    marginTop: -2,
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#542D3C" },
  headerSubtitle: { fontSize: 11, color: "#8E727D", marginTop: 2 },
  headerRightPlaceholder: { width: 38 },

  languageContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F7E6EC",
    paddingVertical: 8,
  },
  languageScroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: "row",
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFF3F6",
    borderWidth: 1,
    borderColor: "#F4D2DE",
    alignItems: "center",
  },
  langChipSelected: {
    backgroundColor: "#B86D84",
    borderColor: "#B86D84",
  },
  langChipNative: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8B5F70",
  },
  langChipNativeSelected: {
    color: "#FFFFFF",
  },
  langChipSub: {
    fontSize: 9.5,
    color: "#A68D95",
    fontWeight: "600",
  },
  langChipSubSelected: {
    color: "#FCECEF",
  },

  messageList: { flex: 1 },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 20,
    marginBottom: 14,
  },
  userBubble: {
    backgroundColor: "#B86D84",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#F7E6EC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  botTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  botTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B86D84",
    textTransform: "uppercase",
  },
  langBadge: {
    backgroundColor: "#FCECEF",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  langBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#8B5F70",
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  userText: { color: "#FFFFFF" },
  botText: { color: "#3B2630" },

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  thinkingText: {
    fontSize: 13,
    color: "#8E727D",
    fontStyle: "italic",
  },

  suggestionsCard: {
    backgroundColor: "#FFFDFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F5E2EA",
    marginVertical: 10,
  },
  suggestionsTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#8B5F70",
    marginBottom: 10,
  },
  suggestionChip: {
    backgroundColor: "#FFF0F4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F9D5E2",
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: "#6B3E50",
    fontWeight: "600",
  },

  disclaimerBar: {
    backgroundColor: "#FFF1F4",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#F7DCE5",
  },
  disclaimerText: {
    fontSize: 10.5,
    color: "#9C6274",
    textAlign: "center",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F7E6EC",
    zIndex: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#EED8E0",
    borderRadius: 24,
    backgroundColor: "#FFFDFC",
    paddingHorizontal: 14,
    minHeight: 46,
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#4A2835",
    backgroundColor: "transparent",
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: "#B496A1",
    fontWeight: "700",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B86D84",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#E4D1D8",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 2,
  },
});
