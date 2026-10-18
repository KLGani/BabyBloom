import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { File } from "expo-file-system";
import {
  createJournal,
  deleteJournal,
  getJournals,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../i18n/translations";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type JournalEntry = {
  _id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  photo?: string;
  week?: number | null;
  createdAt: string;
};

const MOOD_OPTIONS_BY_LANG: Record<SupportedLanguage, { emoji: string; label: string }[]> = {
  English: [
    { emoji: "🌸", label: "Peaceful" },
    { emoji: "😊", label: "Happy" },
    { emoji: "🤰", label: "Blessed" },
    { emoji: "👶", label: "Joyful" },
    { emoji: "😴", label: "Tired" },
    { emoji: "🥺", label: "Emotional" },
    { emoji: "✨", label: "Excited" },
  ],
  Kannada: [
    { emoji: "🌸", label: "ಶಾಂತ" },
    { emoji: "😊", label: "ಸಂತೋಷ" },
    { emoji: "🤰", label: "ಧನ್ಯ" },
    { emoji: "👶", label: "ಹರ್ಷ" },
    { emoji: "😴", label: "ಆಯಾಸ" },
    { emoji: "🥺", label: "ಭಾವನಾತ್ಮಕ" },
    { emoji: "✨", label: "ಉತ್ಸಾಹ" },
  ],
  Hindi: [
    { emoji: "🌸", label: "शांत" },
    { emoji: "😊", label: "खुश" },
    { emoji: "🤰", label: "धन्य" },
    { emoji: "👶", label: "आनंदित" },
    { emoji: "😴", label: "थका हुआ" },
    { emoji: "🥺", label: "भावुक" },
    { emoji: "✨", label: "उत्साहित" },
  ],
  Tamil: [
    { emoji: "🌸", label: "அமைதி" },
    { emoji: "😊", label: "மகிழ்ச்சி" },
    { emoji: "🤰", label: "ஆசீர்வதிக்கப்பட்ட" },
    { emoji: "👶", label: "ஆனந்தம்" },
    { emoji: "😴", label: "சோர்வு" },
    { emoji: "🥺", label: "உணர்ச்சி" },
    { emoji: "✨", label: "உற்சாகம்" },
  ],
  Telugu: [
    { emoji: "🌸", label: "ప్రశాంతత" },
    { emoji: "😊", label: "సంతోషం" },
    { emoji: "🤰", label: "ధన్యం" },
    { emoji: "👶", label: "ఆనందం" },
    { emoji: "😴", label: "అలసట" },
    { emoji: "🥺", label: "భావోద్వేగం" },
    { emoji: "✨", label: "ఉత్సాహం" },
  ],
};

function formatJournalDate(rawDate: string): string {
  try {
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return rawDate;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return rawDate;
  }
}

export default function JournalScreen() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("🌸");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pickingImage, setPickingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        try {
          const token = await SecureStore.getItemAsync("authToken");
          if (!token) {
            router.replace("/");
            return;
          }

          const res = await getJournals(token);
          if (active && res.success && Array.isArray(res.journals)) {
            setJournals(res.journals);
          }
        } catch (err) {
          console.error("Error loading journals:", err);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, [])
  );

  const pickPhoto = async () => {
    try {
      setPickingImage(true);

      // Strategy 1: Use File.pickFileAsync from expo-file-system (native module already integrated in LittleBloom)
      try {
        if (typeof File !== "undefined" && typeof File.pickFileAsync === "function") {
          const result = await File.pickFileAsync({
            mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
            multipleFiles: false,
          });

          if (!result.canceled && result.result) {
            const pickedFile = result.result;
            let base64String = "";
            try {
              if (typeof pickedFile.base64 === "function") {
                base64String = await pickedFile.base64();
              }
            } catch (readErr) {
              console.warn("Could not read base64 directly from File:", readErr);
            }

            const photoUri = base64String
              ? `data:image/jpeg;base64,${base64String}`
              : pickedFile.uri;

            setPhoto(photoUri);
            return;
          }
          return;
        }
      } catch (fileErr: any) {
        console.warn("File.pickFileAsync attempt returned:", fileErr?.message || fileErr);
      }

      // Strategy 2: If expo-image-picker native module is linked, try dynamically
      try {
        const ImagePickerModule = require("expo-image-picker");
        if (ImagePickerModule && typeof ImagePickerModule.launchImageLibraryAsync === "function") {
          const { status } = await ImagePickerModule.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Photos Permission Required",
              "Please allow photo library access to attach ultrasound scans or bump photos."
            );
            return;
          }

          const result = await ImagePickerModule.launchImageLibraryAsync({
            mediaTypes: ImagePickerModule.MediaTypeOptions?.Images || ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6,
            base64: true,
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Data = asset.base64
              ? `data:image/jpeg;base64,${asset.base64}`
              : asset.uri;
            setPhoto(base64Data);
            return;
          }
          return;
        }
      } catch (pickerErr: any) {
        console.warn("Dynamic ImagePicker not available:", pickerErr?.message || pickerErr);
      }

      // Strategy 3: Web browser file picker fallback
      if (Platform.OS === "web" && typeof document !== "undefined") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e: any) => {
          const fileObj = e.target?.files?.[0];
          if (fileObj) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) setPhoto(dataUrl);
            };
            reader.readAsDataURL(fileObj);
          }
        };
        input.click();
        return;
      }

      Alert.alert(
        "Photo Picker Unavailable",
        "Unable to launch photo gallery on this device runtime."
      );
    } catch (err: any) {
      console.error("Error picking photo:", err);
      Alert.alert("Photo Error", err?.message || "Could not select photo.");
    } finally {
      setPickingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing details", "Please provide a title and your thoughts.");
      return;
    }

    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }

      const res = await createJournal(token, {
        title: title.trim(),
        content: content.trim(),
        mood,
        photo: photo || "",
        date: new Date().toISOString(),
      });

      if (res.success && res.journal) {
        setJournals((prev) => [res.journal, ...prev]);
        setModalVisible(false);
        setTitle("");
        setContent("");
        setMood("🌸");
        setPhoto(null);
      } else {
        Alert.alert("Error", res.message || "Could not save journal entry.");
      }
    } catch {
      Alert.alert("Error", "Network error saving journal entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to remove this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) return;
            const res = await deleteJournal(token, id);
            if (res.success) {
              setJournals((prev) => prev.filter((j) => j._id !== id));
            } else {
              Alert.alert("Error", res.message || "Failed to delete.");
            }
          },
        },
      ]
    );
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
            <Text style={styles.headerTitle}>{t.journalTitle}</Text>
            <Text style={styles.headerSubtitle}>{t.journalSubtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Intro banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t.appName}</Text>
            <Text style={styles.bannerText}>
              {t.journalSubtitle}
            </Text>
          </View>
        </View>

        {/* Entries List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t.journal}</Text>
          <Text style={styles.listCount}>{journals.length} {journals.length === 1 ? "entry" : "entries"}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#B86D84" style={{ marginVertical: 30 }} />
        ) : journals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyTitle}>{t.noJournal}</Text>
            <Text style={styles.emptyText}>
              {t.noJournalDesc}
            </Text>
          </View>
        ) : (
          journals.map((entry) => (
            <View key={entry._id} style={styles.entryCard}>
              <View style={styles.entryTop}>
                <View style={styles.moodBadge}>
                  <Text style={styles.moodEmoji}>{entry.mood || "📝"}</Text>
                </View>
                <View style={styles.entryHead}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDate}>
                    {formatJournalDate(entry.date || entry.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(entry._id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.entryContent}>{entry.content}</Text>

              {!!entry.photo && (
                <View style={styles.entryPhotoContainer}>
                  <Image
                    source={{ uri: entry.photo }}
                    style={styles.entryPhoto}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* New Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.newEntry}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t.howAreYouFeeling.toUpperCase()}</Text>
              <View style={styles.moodRow}>
                {(MOOD_OPTIONS_BY_LANG[language] || MOOD_OPTIONS_BY_LANG.English).map((item) => {
                  const isSelected = item.emoji === mood;
                  return (
                    <TouchableOpacity
                      key={item.emoji}
                      style={[styles.moodItem, isSelected && styles.moodItemActive]}
                      onPress={() => setMood(item.emoji)}
                    >
                      <Text style={styles.moodItemEmoji}>{item.emoji}</Text>
                      <Text style={[styles.moodItemLabel, isSelected && styles.moodItemLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>{t.entryTitle.toUpperCase()}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={t.entryTitle}
                placeholderTextColor="#A78B95"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>{t.entryContent.toUpperCase()}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder={t.entryContent}
                placeholderTextColor="#A78B95"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
              />

              <Text style={styles.inputLabel}>{t.addPhoto.toUpperCase()}</Text>
              {photo ? (
                <View style={styles.photoPreviewCard}>
                  <Image
                    source={{ uri: photo }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => setPhoto(null)}
                  >
                    <Text style={styles.removePhotoText}>✕ {t.delete}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickPhotoButton}
                  onPress={pickPhoto}
                  disabled={pickingImage}
                >
                  {pickingImage ? (
                    <ActivityIndicator color="#B86D84" size="small" />
                  ) : (
                    <>
                      <Text style={styles.pickPhotoIcon}>📷</Text>
                      <Text style={styles.pickPhotoText}>{t.addPhoto}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{t.saveJournal} 🌸</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8FA" },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 6,
  },
  langPill: {
    paddingHorizontal: 8,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B86D84",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { fontSize: 24, color: "#FFFFFF", fontWeight: "700", marginTop: -2 },

  banner: {
    backgroundColor: "#FFEAF0",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F7D1DC",
  },
  bannerEmoji: { fontSize: 32, marginRight: 14 },
  bannerTitle: { fontSize: 15, fontWeight: "900", color: "#542D3C" },
  bannerText: { fontSize: 12, color: "#7B5060", marginTop: 2, lineHeight: 18 },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: { fontSize: 18, fontWeight: "900", color: "#542D3C" },
  listCount: { fontSize: 11, color: "#B86D84", fontWeight: "700" },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7E6EC",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#542D3C" },
  emptyText: {
    fontSize: 12,
    color: "#8E727D",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F7E6EC",
    elevation: 1,
  },
  entryTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  moodBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF2F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  moodEmoji: { fontSize: 24 },
  entryHead: { flex: 1 },
  entryTitle: { fontSize: 16, fontWeight: "900", color: "#542D3C" },
  entryDate: { fontSize: 11, color: "#9E7A87", marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 15, color: "#C97083", fontWeight: "800" },
  entryContent: { fontSize: 13, lineHeight: 21, color: "#6A535D" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#542D3C" },
  modalClose: { fontSize: 20, color: "#9C7987", fontWeight: "700" },

  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#B86D84",
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
  },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  moodItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFF5F7",
    borderWidth: 1,
    borderColor: "#F7D8E2",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  moodItemActive: { backgroundColor: "#B86D84", borderColor: "#B86D84" },
  moodItemEmoji: { fontSize: 18 },
  moodItemLabel: { fontSize: 11, fontWeight: "700", color: "#7B5060" },
  moodItemLabelActive: { color: "#FFFFFF" },

  textInput: {
    borderWidth: 1,
    borderColor: "#EED8E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#542D3C",
    backgroundColor: "#FFFDFC",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: "#B86D84",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 16,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  disabledBtn: { opacity: 0.6 },

  // Photo styles
  entryPhotoContainer: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FBF3F6",
    borderWidth: 1,
    borderColor: "#F7E6EC",
  },
  entryPhoto: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  photoPreviewCard: {
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F7D0DC",
    backgroundColor: "#FFF5F7",
    alignItems: "center",
    padding: 10,
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  removePhotoButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FDEAEF",
    borderRadius: 10,
  },
  removePhotoText: {
    color: "#B84A6E",
    fontSize: 12,
    fontWeight: "700",
  },
  pickPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F7C9D8",
    borderStyle: "dashed",
    backgroundColor: "#FFF8FA",
    marginBottom: 6,
  },
  pickPhotoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pickPhotoText: {
    color: "#B86D84",
    fontSize: 13,
    fontWeight: "700",
  },
});
