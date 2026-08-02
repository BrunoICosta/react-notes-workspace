import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, SUPPORTED_LANGUAGES, type Language } from '../../i18n';
import { BrazilFlag, UsaFlag } from './Flags';
import styles from './LanguageSwitcher.module.css';

const FLAGS: Record<Language, ReactNode> = {
  'pt-BR': <BrazilFlag />,
  en: <UsaFlag />,
};

/**
 * Language picker as a radio group of flag buttons (a native select cannot show SVG).
 * Arrow keys move and select, like any radio group; only the active flag is tabbable.
 * The choice is persisted by the i18next language detector.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  const buttons = useRef(new Map<Language, HTMLButtonElement>());

  const select = (language: Language) => {
    if (language !== current) void i18n.changeLanguage(language);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const index = SUPPORTED_LANGUAGES.indexOf(current);
    const next =
      SUPPORTED_LANGUAGES[(index + step + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length];
    select(next);
    buttons.current.get(next)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={t('language.label')}
      className={styles.group}
      onKeyDown={handleKeyDown}
    >
      {SUPPORTED_LANGUAGES.map((language) => {
        // Each option is named in its own language, so speakers can always find theirs.
        const name = t(`language.names.${language}`, { lng: language });
        const checked = language === current;
        return (
          <button
            key={language}
            ref={(element) => {
              if (element) buttons.current.set(language, element);
              else buttons.current.delete(language);
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={name}
            title={name}
            lang={language}
            tabIndex={checked ? 0 : -1}
            className={styles.option}
            onClick={() => select(language)}
          >
            {FLAGS[language]}
          </button>
        );
      })}
    </div>
  );
}
