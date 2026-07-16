import { useEffect, useRef } from 'react';

export interface HotkeyOptions {
  /** Requires Ctrl on Windows/Linux or ⌘ on macOS. */
  mod?: boolean;
  shift?: boolean;
}

export const isMac =
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

/** Human readable label for the platform modifier key. */
export const MOD_KEY_LABEL = isMac ? '⌘' : 'Ctrl';

/** Registers a global keyboard shortcut for as long as the component is mounted. */
export function useHotkey(key: string, handler: () => void, options: HotkeyOptions = {}): void {
  const handlerRef = useRef(handler);
  const { mod = false, shift = false } = options;

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (mod !== (event.ctrlKey || event.metaKey)) return;
      if (shift !== event.shiftKey) return;
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, mod, shift]);
}
