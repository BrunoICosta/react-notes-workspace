import i18next, { type i18n as I18nInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  defaultNS,
  NAMESPACES,
  resources,
  SUPPORTED_LANGUAGES,
  type Language,
} from './resources';

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from './resources';

export const LANGUAGE_STORAGE_KEY = 'notes-workspace:language';

/** Maps any browser/stored language tag to a supported one: pt* -> pt-BR, anything else -> en. */
export function normalizeLanguage(language: string | null | undefined): Language {
  if (!language) return DEFAULT_LANGUAGE;
  return language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** Keeps `<html lang>` (and the meta description) in sync with the active language. */
function syncDocument(instance: I18nInstance): void {
  const language = normalizeLanguage(instance.resolvedLanguage ?? instance.language);
  document.documentElement.lang = language;
  document.title = instance.t('common:appName', { lng: language });
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', instance.t('common:metaDescription', { lng: language }));
}

/**
 * Creates a configured i18next instance. Language priority: saved choice
 * (localStorage) > browser language > pt-BR. Resources are bundled, so init is synchronous.
 *
 * `attach` binds the instance to React and to the document; tests pass `false` to create
 * throwaway instances without touching the app-wide one.
 */
export function createI18n({ attach = true }: { attach?: boolean } = {}): I18nInstance {
  const instance = i18next.createInstance().use(LanguageDetector);
  if (attach) instance.use(initReactI18next);
  void instance.init({
    resources,
    ns: NAMESPACES,
    defaultNS,
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    initAsync: false,
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: normalizeLanguage,
    },
  });
  if (attach) {
    instance.on('languageChanged', () => syncDocument(instance));
    syncDocument(instance);
  }
  return instance;
}

const i18n = createI18n();

/** Active language, always one of the supported ones. */
export function currentLanguage(): Language {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
}

export default i18n;
