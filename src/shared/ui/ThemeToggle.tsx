import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../features/preferences/preferencesStore';
import { Icon } from './Icon';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.enableLight') : t('theme.enableDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}
