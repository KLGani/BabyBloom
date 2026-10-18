import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "../utils/storage";
import { SupportedLanguage, TRANSLATIONS, TranslationKeys } from "../i18n/translations";

export type LanguageItem = {
  id: SupportedLanguage;
  label: string;
  nativeLabel: string;
  icon: string;
};

export const AVAILABLE_LANGUAGES: LanguageItem[] = [
  { id: "English", label: "English", nativeLabel: "English", icon: "🇬🇧" },
  { id: "Kannada", label: "Kannada", nativeLabel: "ಕನ್ನಡ", icon: "🌸" },
  { id: "Hindi", label: "Hindi", nativeLabel: "हिंदी", icon: "🌼" },
  { id: "Tamil", label: "Tamil", nativeLabel: "தமிழ்", icon: "🌻" },
  { id: "Telugu", label: "Telugu", nativeLabel: "తెలుగు", icon: "🌷" },
];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: TranslationKeys;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (chosenLang?: SupportedLanguage) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  languages: LanguageItem[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "English",
  setLanguage: async () => {},
  t: TRANSLATIONS.English,
  hasCompletedOnboarding: true,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
  languages: AVAILABLE_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("English");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedLang = await SecureStore.getItemAsync("appLanguage");
      if (
        storedLang &&
        ["English", "Kannada", "Hindi", "Tamil", "Telugu"].includes(storedLang)
      ) {
        setLanguageState(storedLang as SupportedLanguage);
      }

      const onboarded = await SecureStore.getItemAsync("hasCompletedOnboarding");
      // If flag is not explicitly 'true', user should go through first-time onboarding
      setHasCompletedOnboarding(onboarded === "true");
    } catch (e) {
      console.warn("LanguageContext load error:", e);
    } finally {
      setIsReady(true);
    }
  };

  const setLanguage = async (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      await SecureStore.setItemAsync("appLanguage", newLang);
    } catch (e) {
      console.warn("Failed to persist appLanguage:", e);
    }
  };

  const completeOnboarding = async (chosenLang?: SupportedLanguage) => {
    const langToSave = chosenLang || language;
    setLanguageState(langToSave);
    setHasCompletedOnboarding(true);
    try {
      await SecureStore.setItemAsync("appLanguage", langToSave);
      await SecureStore.setItemAsync("hasCompletedOnboarding", "true");
    } catch (e) {
      console.warn("Failed to persist onboarding state:", e);
    }
  };

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false);
    try {
      await SecureStore.deleteItemAsync("hasCompletedOnboarding");
    } catch (e) {
      console.warn("Failed to reset onboarding state:", e);
    }
  };

  const currentTranslations = TRANSLATIONS[language] || TRANSLATIONS.English;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentTranslations,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        languages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
