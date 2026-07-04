import { usePreferencesStore } from '../../features/preferences/preferencesStore';
import { Icon } from './Icon';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const theme = usePreferencesStore((state) => state.theme);
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}
