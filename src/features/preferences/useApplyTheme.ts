import { useEffect } from 'react';
import { usePreferencesStore } from './preferencesStore';

/** Mirrors the selected theme onto <html data-theme> so the CSS tokens switch. */
export function useApplyTheme(): void {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
