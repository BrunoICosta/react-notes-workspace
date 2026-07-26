import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { isLanguage, normalizeLanguage, SUPPORTED_LANGUAGES } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

/** Compact, labelled language select. The choice is persisted by the i18next detector. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const id = useId();
  const current = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

  return (
    <div className={styles.switcher}>
      <label htmlFor={id} className="visually-hidden">
        {t('language.label')}
      </label>
      <select
        id={id}
        className={styles.select}
        value={current}
        title={t('language.label')}
        onChange={(event) => {
          if (isLanguage(event.target.value)) void i18n.changeLanguage(event.target.value);
        }}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language} lang={language}>
            {t(`language.names.${language}`)}
          </option>
        ))}
      </select>
      <span className={styles.badge} aria-hidden="true">
        {current === 'pt-BR' ? 'PT' : 'EN'}
      </span>
    </div>
  );
}
