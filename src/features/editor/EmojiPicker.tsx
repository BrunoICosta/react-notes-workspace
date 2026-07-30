import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAnchoredPosition, useDismiss } from '../../shared/hooks/useFloating';
import styles from './EmojiPicker.module.css';

// prettier-ignore
const PAGE_EMOJIS = [
  '📄', '📝', '📌', '📎', '📚', '📖', '🗂️', '🗒️',
  '✅', '🎯', '🚀', '💡', '⭐', '🔥', '⚡', '🧠',
  '💼', '📊', '📈', '🗓️', '⏰', '🧾', '💰', '🛒',
  '🏠', '✈️', '🌱', '🍳', '🎨', '🎵', '🎮', '📷',
  '💻', '🛠️', '🐛', '🔒', '🧪', '🤖', '🌐', '📦',
  '👋', '😀', '❤️', '🎉', '🌙', '☀️', '🌈', '🍀',
];

const COLUMNS = 8;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  triggerClassName?: string;
}

export function EmojiPicker({ value, onChange, triggerClassName }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('editor');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const position = useAnchoredPosition(open, triggerRef, panelRef);
  const dismissRefs = useMemo(() => [triggerRef, panelRef], []);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, dismissRefs, close);

  useLayoutEffect(() => {
    if (!open) return;
    const selected = panelRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    (selected ?? panelRef.current?.querySelector<HTMLElement>('button'))?.focus();
  }, [open]);

  const choose = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const buttons = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('[data-emoji]') ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
    };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    buttons[Math.min(buttons.length - 1, Math.max(0, index + delta))]?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={t('icon.change')}
        title={t('icon.changeShort')}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">{value}</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t('icon.choose')}
            className={styles.panel}
            style={{ top: position.top, left: position.left }}
            onKeyDown={handleKeyDown}
          >
            <div className={styles.header}>
              <span className={styles.heading}>{t('icon.heading')}</span>
              <button
                type="button"
                className={styles.random}
                onClick={() => choose(PAGE_EMOJIS[Math.floor(Math.random() * PAGE_EMOJIS.length)])}
              >
                {t('icon.random')}
              </button>
            </div>
            <div className={styles.grid}>
              {PAGE_EMOJIS.map((emoji, index) => (
                <button
                  key={emoji}
                  type="button"
                  className={styles.emoji}
                  data-emoji
                  aria-label={t('icon.use', { emoji })}
                  aria-pressed={emoji === value}
                  tabIndex={
                    emoji === value || (index === 0 && !PAGE_EMOJIS.includes(value)) ? 0 : -1
                  }
                  onClick={() => choose(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
