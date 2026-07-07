import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from './Icon';
import styles from './DropdownMenu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface DropdownMenuProps {
  /** Accessible name of the trigger button. */
  label: string;
  items: MenuItem[];
  triggerClassName?: string;
  triggerContent: ReactNode;
}

interface Position {
  top: number;
  left: number;
}

const MENU_WIDTH = 220;
const VIEWPORT_GUTTER = 8;

/**
 * Menu button following the WAI-ARIA menu pattern: arrow keys move between items,
 * Home/End jump, Escape closes and returns focus to the trigger.
 */
export function DropdownMenu({
  label,
  items,
  triggerClassName,
  triggerContent,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const fitsBelow = rect.bottom + menuHeight + VIEWPORT_GUTTER <= window.innerHeight;
    setPosition({
      top: fitsBelow ? rect.bottom + 4 : Math.max(VIEWPORT_GUTTER, rect.top - menuHeight - 4),
      left: Math.max(
        VIEWPORT_GUTTER,
        Math.min(rect.left, window.innerWidth - MENU_WIDTH - VIEWPORT_GUTTER),
      ),
    });
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    };
    const handleResize = () => close(false);
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, close]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [],
    );
    const index = enabled.indexOf(document.activeElement as HTMLElement);
    const focusAt = (next: number) => enabled[(next + enabled.length) % enabled.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(enabled.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {triggerContent}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className={styles.menu}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            onKeyDown={handleMenuKeyDown}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={styles.item}
                data-danger={item.danger || undefined}
                disabled={item.disabled}
                onClick={() => {
                  close(false);
                  item.onSelect();
                }}
              >
                {item.icon && <Icon name={item.icon} />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
