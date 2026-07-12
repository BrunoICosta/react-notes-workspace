import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { BlockTypeConfig } from './blockConfig';
import { slashOptionId } from './blockMenu';
import styles from './SlashMenu.module.css';

interface SlashMenuProps {
  id: string;
  items: BlockTypeConfig[];
  activeIndex: number;
  anchor: HTMLElement | null;
  onSelect: (item: BlockTypeConfig) => void;
  onHover: (index: number) => void;
}

const GUTTER = 8;
const MAX_HEIGHT = 320;

/** Floating listbox of block types. Keyboard handling lives in the editor textarea. */
export function SlashMenu({ id, items, activeIndex, anchor, onSelect, onHover }: SlashMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const height = Math.min(listRef.current?.offsetHeight ?? MAX_HEIGHT, MAX_HEIGHT);
    const fitsBelow = rect.bottom + height + GUTTER <= window.innerHeight;
    setPosition({
      top: fitsBelow ? rect.bottom + 4 : Math.max(GUTTER, rect.top - height - 4),
      left: Math.max(GUTTER, Math.min(rect.left, window.innerWidth - 300 - GUTTER)),
    });
  }, [anchor, items.length]);

  useLayoutEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    active?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  return createPortal(
    <div
      ref={listRef}
      id={id}
      role="listbox"
      aria-label="Tipos de bloco"
      className={styles.menu}
      style={{ top: position.top, left: position.left }}
    >
      {items.length === 0 ? (
        <div className={styles.empty}>Nenhum bloco encontrado</div>
      ) : (
        <>
          <div className={styles.heading} aria-hidden="true">
            Blocos básicos
          </div>
          {items.map((item, index) => (
            <div
              key={item.type}
              id={slashOptionId(id, index)}
              role="option"
              aria-selected={index === activeIndex}
              className={styles.option}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => onHover(index)}
              onClick={() => onSelect(item)}
            >
              <span className={styles.glyph} aria-hidden="true">
                {item.glyph}
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.description}>{item.description}</span>
              </span>
            </div>
          ))}
        </>
      )}
    </div>,
    document.body,
  );
}
