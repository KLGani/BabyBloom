
import { File, Paths } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as Sharing from "expo-sharing";

import {
  getReports,
  uploadReport,
  deleteReport,
  getReportFileUrl,
} from "../../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelectorModal from "../components/LanguageSelectorModal";

type Report = {
  _id: string;
  title: string;
  category: string;
  reportDate: string;
  originalName: string;
  mimeType: string;
  size: number;
};

const categories = [
  "Blood Test",
  "Ultrasound",
  "Prescription",
  "Scan",
  "Other",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Display an ISO backend date as DD-MM-YYYY without timezone conversion.
function formatReportDate(value?: string | null): string {
  if (!value) return "Date unavailable";

  const raw = String(value).trim();

  // Normal backend format: YYYY-MM-DD or an ISO timestamp.
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    const check = new Date(Date.UTC(y, m - 1, d));

    if (
      check.getUTCFullYear() !== y ||
      check.getUTCMonth() !== m - 1 ||
      check.getUTCDate() !== d
    ) {
      return "Date unavailable";
    }

    return `${day}-${month}-${year}`;
  }

  // Also accept a date that is already DD-MM-YYYY.
  const dmyMatch = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;

    const d = Number(day);
    const m = Number(month);
    const y = Number(year);
    const check = new Date(Date.UTC(y, m - 1, d));

    if (
      check.getUTCFullYear() === y &&
      check.getUTCMonth() === m - 1 &&
      check.getUTCDate() === d
    ) {
      return `${day}-${month}-${year}`;
    }
  }

  return "Date unavailable";
}

function getTodayDDMMYYYY(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

function convertDDMMYYYYToISO(value: string): string | null {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getFileMimeType(file: File): string {
  if (file.type) return file.type;

  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "application/octet-stream";
}

export default function ReportsScreen() {
  const { t, language } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Blood Test");
  const [reportDate, setReportDate] = useState(getTodayDDMMYYYY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        router.replace("/");
        return;
      }

      const response = await getReports(token);

      if (response.success) {
        setReports(response.reports || []);
      } else {
        Alert.alert(
          "Reports",
          response.message || "Unable to load reports."
        );
      }
    } catch (error) {
      console.error("Load reports error:", error);
      Alert.alert("Error", "Unable to load your medical reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  const chooseFile = async () => {
    try {
      const result = await File.pickFileAsync({
        mimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
        ],
        multipleFiles: false,
      });

      if (result.canceled || !result.result) {
        return;
      }

      const file = result.result;

      if (file.size > MAX_FILE_SIZE) {
        Alert.alert(
          "File too large",
          "Choose a PDF or image smaller than 5 MB."
        );
        return;
      }

      const mimeType = getFileMimeType(file);

      if (
        ![
          "application/pdf",
          "image/jpeg",
          "image/png",
        ].includes(mimeType)
      ) {
        Alert.alert(
          "Unsupported file",
          "Please choose a PDF, JPG, JPEG, or PNG file."
        );
        return;
      }

      setSelectedFile(file);

      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (error) {
      console.error("File selection error:", error);

      Alert.alert(
        "File selection failed",
        error instanceof Error
          ? error.message
          : "Unable to select the file."
      );
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Enter a title for this report.");
      return;
    }

    if (!selectedFile) {
      Alert.alert("No file selected", "Please select a PDF or image.");
      return;
    }

    const formattedDateForBackend =
      convertDDMMYYYYToISO(reportDate);

    if (!formattedDateForBackend) {
      Alert.alert(
        "Invalid date",
        "Enter a real calendar date in DD-MM-YYYY format, for example 11-10-2026."
      );
      return;
    }

    try {
      setUploading(true);

      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        router.replace("/");
        return;
      }

      const response = await uploadReport(token, {
        title: title.trim(),
        category,
        // IMPORTANT: send YYYY-MM-DD to the backend.
        reportDate: formattedDateForBackend,
        file: selectedFile,
        name: selectedFile.name,
        mimeType: getFileMimeType(selectedFile),
      });

      if (!response?.success) {
        Alert.alert(
          "Upload failed",
          response?.message || "The server could not upload your report."
        );
        return;
      }

      Alert.alert("Success", "Your report has been uploaded.");

      setTitle("");
      setCategory("Blood Test");
      setReportDate(getTodayDDMMYYYY());
      setSelectedFile(null);

      await loadReports();
    } catch (error) {
      console.error("Report upload error:", error);

      Alert.alert(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload your report."
      );
    } finally {
      setUploading(false);
    }
  };

  const openReport = async (
    report: Report,
    action: "view" | "download"
  ) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        router.replace("/");
        return;
      }

      const url = getReportFileUrl(report._id, action);

      const response = await expoFetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Request failed (${response.status})`
        );
      }

      const safeName = report.originalName.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const extension =
        report.mimeType === "application/pdf"
          ? "pdf"
          : report.mimeType === "image/png"
          ? "png"
          : "jpg";

      const finalName = safeName.includes(".")
        ? safeName
        : `${safeName}.${extension}`;

      const localFile = new File(
        Paths.cache,
        `${Date.now()}-${finalName}`
      );

      await localFile.write(
        new Uint8Array(await response.arrayBuffer())
      );

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "File ready",
          `The report was retrieved and saved temporarily as ${finalName}.`
        );
        return;
      }

      await Sharing.shareAsync(localFile.uri, {
        mimeType: report.mimeType,
        dialogTitle:
          action === "view"
            ? report.title
            : `Save or share ${report.title}`,
        UTI:
          report.mimeType === "application/pdf"
            ? "com.adobe.pdf"
            : undefined,
      });
    } catch (error) {
      console.error("Report retrieval error:", error);

      Alert.alert(
        "Report unavailable",
        error instanceof Error
          ? error.message
          : "Unable to retrieve this report."
      );
    }
  };

  const confirmDelete = (report: Report) => {
    Alert.alert(
      "Delete report",
      `Delete "${report.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token =
                await SecureStore.getItemAsync("authToken");

              if (!token) {
                router.replace("/");
                return;
              }

              const response = await deleteReport(
                token,
                report._id
              );

              if (!response.success) {
                Alert.alert(
                  "Delete failed",
                  response.message || "Unable to delete report."
                );
                return;
              }

              setReports((current) =>
                current.filter((item) => item._id !== report._id)
              );

              Alert.alert("Deleted", "The report has been deleted.");
            } catch (error) {
              console.error("Delete report error:", error);
              Alert.alert("Error", "Unable to delete this report.");
            }
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "Unknown size";

    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹  {t.back}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setShowLangModal(true)}
          >
            <Text style={styles.langPillText}>🌐 {language} ▾</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>{t.appName.toUpperCase()}</Text>
        <Text style={styles.heading}>{t.reportsTitle}</Text>
        <Text style={styles.subtitle}>
          {t.reportsSubtitle}
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t.uploadReport}</Text>

          <Text style={styles.label}>{t.reports}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t.reports}
            placeholderTextColor="#999"
            style={styles.input}
            maxLength={120}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categories}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  category === item && styles.categorySelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Report date (DD-MM-YYYY)</Text>
          <TextInput
            value={reportDate}
            onChangeText={setReportDate}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="#999"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <TouchableOpacity
            style={styles.fileButton}
            onPress={chooseFile}
          >
            <Text style={styles.fileButtonText}>
              {selectedFile
                ? "Change selected file"
                : "＋ Choose PDF or image"}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <Text style={styles.fileName}>
              Selected: {selectedFile.name}
            </Text>
          )}

          <Text style={styles.hint}>
            PDF, JPG or PNG · Maximum 5 MB
          </Text>

          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploading && styles.disabledButton,
            ]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>
                {t.uploadReport}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{t.reports}</Text>
          <TouchableOpacity onPress={loadReports}>
            <Text style={styles.refreshText}>{t.confirm}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#B66B8B"
            style={styles.loader}
          />
        ) : reports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>{t.noReports}</Text>
            <Text style={styles.emptyText}>
              {t.noReportsDesc}
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report._id} style={styles.reportCard}>
              <View style={styles.reportIcon}>
                <Text style={styles.reportIconText}>
                  {report.mimeType === "application/pdf" ? "PDF" : "IMG"}
                </Text>
              </View>

              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>

                <Text style={styles.reportMeta}>
                  {report.category} · {formatReportDate(report.reportDate)}
                </Text>

                <Text style={styles.reportMeta}>
                  {report.originalName} · {formatSize(report.size)}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => openReport(report, "view")}
                  >
                    <Text style={styles.smallButtonText}>
                      View / Share
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => openReport(report, "download")}
                  >
                    <Text style={styles.smallButtonText}>Download</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(report)}
                  >
                    <Text style={styles.deleteText}>{t.delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          {t.disclaimer}
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
  safe: {
    flex: 1,
    backgroundColor: "#FFF8FB",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F8E7EF",
  },
  backText: {
    color: "#854B68",
    fontSize: 16,
    fontWeight: "600",
  },
  eyebrow: {
    color: "#B66B8B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    fontSize: 29,
    fontWeight: "800",
    color: "#583B4A",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#806D77",
    marginTop: 6,
    marginBottom: 22,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1DDE6",
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#583B4A",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#705562",
    marginTop: 16,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EBD9E2",
    backgroundColor: "#FFFCFD",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 15,
    color: "#3D3036",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#EBD9E2",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#FFFCFD",
  },
  categorySelected: {
    backgroundColor: "#B66B8B",
    borderColor: "#B66B8B",
  },
  categoryText: {
    color: "#765968",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  fileButton: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#C88DA7",
    borderStyle: "dashed",
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#FFF8FB",
  },
  fileButtonText: {
    color: "#995778",
    fontWeight: "700",
    fontSize: 14,
  },
  fileName: {
    color: "#583B4A",
    marginTop: 9,
    fontSize: 13,
  },
  hint: {
    color: "#8D7C84",
    fontSize: 12,
    marginTop: 7,
  },
  uploadButton: {
    marginTop: 18,
    borderRadius: 13,
    backgroundColor: "#B66B8B",
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  refreshText: {
    color: "#995778",
    fontWeight: "700",
  },
  loader: {
    marginVertical: 28,
  },
  emptyCard: {
    padding: 28,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1DDE6",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#583B4A",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: "#8D7C84",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
  reportCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1DDE6",
    marginBottom: 12,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F8E7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  reportIconText: {
    color: "#995778",
    fontWeight: "800",
    fontSize: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    color: "#583B4A",
    fontSize: 15,
    fontWeight: "800",
  },
  reportMeta: {
    color: "#8D7C84",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  smallButton: {
    backgroundColor: "#F8E7EF",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  smallButtonText: {
    color: "#854B68",
    fontWeight: "700",
    fontSize: 11,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#E8B9B9",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteText: {
    color: "#B44545",
    fontWeight: "700",
    fontSize: 11,
  },
  footer: {
    color: "#9B8991",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 24,
  },
});
