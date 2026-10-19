import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SupportedLanguage } from "../i18n/translations";
import { AVAILABLE_LANGUAGES, useLanguage } from "../context/LanguageContext";

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>🌐 {t.switchLanguage}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.headerSubtitle}>
                Select your preferred language:
              </Text>

              <View style={styles.list}>
                {AVAILABLE_LANGUAGES.map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.langItem,
                        isSelected && styles.langItemActive,
                      ]}
                      onPress={() => handleSelect(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.langLeft}>
                        <Text style={styles.langIcon}>{item.icon}</Text>
                        <View>
                          <Text
                            style={[
                              styles.langNative,
                              isSelected && styles.langNativeActive,
                            ]}
                          >
                            {item.nativeLabel}
                          </Text>
                          <Text style={styles.langEnglish}>
                            {item.label}
                          </Text>
                        </View>
                      </View>
                      {isSelected ? (
                        <Text style={styles.checkMark}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#54313D",
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: "#8B6B75",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8B6B75",
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FAF4F6",
    borderWidth: 1.5,
    borderColor: "#EAD2DA",
  },
  langItemActive: {
    backgroundColor: "#FFF0F4",
    borderColor: "#C47A91",
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langIcon: {
    fontSize: 22,
  },
  langNative: {
    fontSize: 16,
    fontWeight: "800",
    color: "#54313D",
  },
  langNativeActive: {
    color: "#C47A91",
  },
  langEnglish: {
    fontSize: 12,
    color: "#8B6B75",
  },
  checkMark: {
    fontSize: 18,
    fontWeight: "900",
    color: "#C47A91",
  },
});

export default LanguageSelectorModal;
