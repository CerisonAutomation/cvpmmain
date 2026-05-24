/** i18n stub — extend with react-i18next when multi-language is required */
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en"];

export function t(key, locale = DEFAULT_LOCALE) {
  const strings = {
    en: {
      "nav.properties": "Properties",
      "nav.owners": "For Owners",
    },
  };
  return strings[locale]?.[key] ?? key;
}
