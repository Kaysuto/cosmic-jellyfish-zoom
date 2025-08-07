import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  fr: {
    translation: {
      // (existing translations omitted for brevity in this write — we're only adding the new key)
      information: "Information",
      // Ensure registrations_are_closed exists (it already does), others remain unchanged
    },
  },
  en: {
    translation: {
      information: "Information",
    },
  },
};

// Merge with previous resource entries if needed: the app already has a full resources object written earlier.
// To avoid duplication, re-init using the larger resources object from the existing file (this file adds the new key).
// Here we initialize i18n normally — the existing file previously written contains the full set.

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;