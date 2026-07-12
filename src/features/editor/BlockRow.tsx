import { memo, useRef, type KeyboardEvent } from 'react';
import { useAutoResize } from '../../shared/hooks/useAutoResize';
import type { Block } from '../workspace/model/types';
import { BLOCK_CONFIG } from './blockConfig';
import styles from './BlockEditor.module.css';

export interface BlockRowProps {
  block: Block;
  /** Position within a numbered list run (only used by numbered blocks). */
  listNumber: number;
  registerRef: (id: string, element: HTMLElement | null) => void;
  onTextChange: (block: Block, text: string, element: HTMLTextAreaElement) => void;
  onToggleTodo: (block: Block) => void;
  onKeyDown: (block: Block, event: KeyboardEvent<HTMLElement>) => void;
  onBlur?: (block: Block) => void;
  /** Present while the slash menu is open for this block. */
  slashMenu?: { listId: string; activeOptionId?: string };
}

function BlockRowComponent({
  block,
  listNumber,
  registerRef,
  onTextChange,
  onToggleTodo,
  onKeyDown,
  onBlur,
  slashMenu,
}: BlockRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResize(textareaRef, block.text);
  const config = BLOCK_CONFIG[block.type];

  if (block.type === 'divider') {
    return (
      <div className={styles.row} data-type="divider">
        <div
          ref={(element) => registerRef(block.id, element)}
          className={styles.divider}
          role="separator"
          aria-label="Divisor (Backspace para remover)"
          tabIndex={0}
          onKeyDown={(event) => onKeyDown(block, event)}
          onBlur={() => onBlur?.(block)}
        >
          <hr />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.row} data-type={block.type} data-checked={block.checked || undefined}>
      {block.type === 'todo' && (
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={block.checked}
          onChange={() => onToggleTodo(block)}
          aria-label={block.checked ? 'Marcar como pendente' : 'Marcar como concluída'}
        />
      )}
      {block.type === 'bulleted' && (
        <span className={styles.marker} aria-hidden="true">
          •
        </span>
      )}
      {block.type === 'numbered' && (
        <span className={styles.marker} aria-hidden="true">
          {listNumber}.
        </span>
      )}
      {block.type === 'callout' && (
        <span className={styles.calloutIcon} aria-hidden="true">
          💡
        </span>
      )}
      <textarea
        ref={(element) => {
          textareaRef.current = element;
          registerRef(block.id, element);
        }}
        className={styles.input}
        value={block.text}
        rows={1}
        placeholder={config.placeholder}
        aria-label={config.label}
        spellCheck={block.type !== 'code'}
        onChange={(event) => onTextChange(block, event.target.value, event.target)}
        onKeyDown={(event) => onKeyDown(block, event)}
        onBlur={() => onBlur?.(block)}
        aria-controls={slashMenu?.listId}
        aria-activedescendant={slashMenu?.activeOptionId}
        aria-autocomplete={slashMenu ? 'list' : undefined}
      />
    </div>
  );
}

export const BlockRow = memo(BlockRowComponent);
