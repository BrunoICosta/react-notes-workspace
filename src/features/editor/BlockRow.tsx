import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoResize } from '../../shared/hooks/useAutoResize';
import { Icon } from '../../shared/ui/Icon';
import type { Block } from '../workspace/model/types';
import styles from './BlockEditor.module.css';

export interface BlockRowProps {
  block: Block;
  /** Position within a numbered list run (only used by numbered blocks). */
  listNumber: number;
  registerRef: (id: string, element: HTMLElement | null) => void;
  onTextChange: (block: Block, text: string, element: HTMLTextAreaElement) => void;
  onToggleTodo: (block: Block) => void;
  onKeyDown: (block: Block, event: KeyboardEvent<HTMLElement>) => void;
  onInsertBelow: (block: Block) => void;
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
  onInsertBelow,
  onBlur,
  slashMenu,
}: BlockRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoResize(textareaRef, block.text);
  const { t } = useTranslation('editor');
  const label = t(`blocks.${block.type}.label`);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const gutter = (
    <div className={styles.gutter}>
      <button
        type="button"
        className={styles.gutterButton}
        onClick={() => onInsertBelow(block)}
        aria-label={t('insertBelow')}
        title={t('insertBelow')}
        tabIndex={-1}
      >
        <Icon name="plus" size={14} />
      </button>
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={styles.gutterButton}
        data-handle
        title={t('dragHint')}
        {...attributes}
        {...listeners}
        aria-label={t('moveBlock', { type: label })}
      >
        <Icon name="grip" size={14} />
      </button>
    </div>
  );

  let content: ReactNode;
  if (block.type === 'divider') {
    content = (
      <div className={styles.row} data-type="divider">
        <div
          ref={(element) => registerRef(block.id, element)}
          className={styles.divider}
          role="separator"
          aria-label={t('dividerLabel')}
          tabIndex={0}
          onKeyDown={(event) => onKeyDown(block, event)}
          onBlur={() => onBlur?.(block)}
        >
          <hr />
        </div>
      </div>
    );
  } else {
    content = (
      <div className={styles.row} data-type={block.type} data-checked={block.checked || undefined}>
        {block.type === 'todo' && (
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={block.checked}
            onChange={() => onToggleTodo(block)}
            aria-label={block.checked ? t('todo.markPending') : t('todo.markDone')}
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
          placeholder={t(`blocks.${block.type}.placeholder`)}
          aria-label={label}
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

  return (
    <div
      ref={setNodeRef}
      className={styles.block}
      data-type={block.type}
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {gutter}
      {content}
    </div>
  );
}

export const BlockRow = memo(BlockRowComponent);
