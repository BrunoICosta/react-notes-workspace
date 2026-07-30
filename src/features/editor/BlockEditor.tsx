import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  useCallback,
  useMemo,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getListNumber } from '../workspace/model/blocks';
import type { Block, BlockType, Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { BlockRow } from './BlockRow';
import {
  focusWithCaret,
  isCaretAtStart,
  isCaretOnFirstLine,
  isCaretOnLastLine,
  type CaretTarget,
} from './caret';
import { detectShortcut } from './markdownShortcuts';
import { SlashMenu } from './SlashMenu';
import { restrictToVerticalAxis, useBlockDnd } from './useBlockDnd';
import { useSlashMenu } from './useSlashMenu';
import styles from './BlockEditor.module.css';

/** Blocks that turn back into a paragraph when Enter is pressed while empty. */
const EXIT_ON_EMPTY_ENTER = new Set<BlockType>([
  'todo',
  'bulleted',
  'numbered',
  'quote',
  'callout',
]);

export interface BlockEditorHandle {
  /** Focuses the first block, creating one when the page is empty. */
  focusFirstBlock: () => void;
}

interface BlockEditorProps {
  page: Page;
  /** Called when the caret leaves the first block upwards (e.g. to focus the title). */
  onExitTop?: () => void;
  ref?: Ref<BlockEditorHandle>;
}

interface FocusRequest {
  blockId: string;
  caret: CaretTarget;
}

export function BlockEditor({ page, onExitTop, ref }: BlockEditorProps) {
  const pageId = page.id;
  const elements = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<FocusRequest | null>(null);
  const { t } = useTranslation('editor');

  const insertBlock = useWorkspaceStore((state) => state.insertBlock);
  const updateBlockText = useWorkspaceStore((state) => state.updateBlockText);
  const toggleTodo = useWorkspaceStore((state) => state.toggleTodo);
  const changeBlockType = useWorkspaceStore((state) => state.changeBlockType);
  const removeBlock = useWorkspaceStore((state) => state.removeBlock);
  const splitBlock = useWorkspaceStore((state) => state.splitBlock);
  const mergeWithPrevious = useWorkspaceStore((state) => state.mergeWithPrevious);

  const registerRef = useCallback((id: string, element: HTMLElement | null) => {
    if (element) elements.current.set(id, element);
    else elements.current.delete(id);
  }, []);

  // Focus requests are resolved after render, once the target block exists in the DOM.
  useLayoutEffect(() => {
    const request = pendingFocus.current;
    if (!request) return;
    const element = elements.current.get(request.blockId);
    if (!element) return;
    pendingFocus.current = null;
    focusWithCaret(element, request.caret);
  });

  /**
   * Focuses a block after the next render. Used right after store updates, because
   * React rewriting a textarea value would otherwise move the caret to the end.
   */
  const requestFocus = useCallback((blockId: string, caret: CaretTarget) => {
    pendingFocus.current = { blockId, caret };
  }, []);

  /** Focuses an already rendered block immediately (pure navigation, no state change). */
  const focusNow = useCallback((blockId: string, caret: CaretTarget) => {
    const element = elements.current.get(blockId);
    if (!element) return false;
    focusWithCaret(element, caret);
    return true;
  }, []);

  const slash = useSlashMenu({ pageId, requestFocus });
  const { trackInput, handleKeyDown: handleSlashKeyDown, close: closeSlashMenu } = slash;

  const getBlocks = useCallback(
    () => useWorkspaceStore.getState().pages[pageId]?.blocks ?? [],
    [pageId],
  );

  useImperativeHandle(
    ref,
    () => ({
      focusFirstBlock: () => {
        const first = getBlocks()[0];
        if (first) focusNow(first.id, 'start');
        else requestFocus(insertBlock(pageId, null), 'start');
      },
    }),
    [focusNow, getBlocks, insertBlock, pageId, requestFocus],
  );

  const handleTextChange = useCallback(
    (block: Block, text: string, element: HTMLTextAreaElement) => {
      const shortcut = block.type === 'paragraph' ? detectShortcut(block.text, text) : null;
      if (!shortcut) {
        updateBlockText(pageId, block.id, text);
        trackInput(block, text, element);
        return;
      }
      if (shortcut.type === 'divider') {
        changeBlockType(pageId, block.id, 'divider');
        requestFocus(insertBlock(pageId, block.id, 'paragraph', shortcut.text), 'start');
        return;
      }
      updateBlockText(pageId, block.id, shortcut.text);
      changeBlockType(pageId, block.id, shortcut.type);
      requestFocus(block.id, 'start');
    },
    [changeBlockType, insertBlock, pageId, requestFocus, trackInput, updateBlockText],
  );

  const handleToggleTodo = useCallback(
    (block: Block) => toggleTodo(pageId, block.id),
    [pageId, toggleTodo],
  );

  const focusSibling = useCallback(
    (index: number, direction: -1 | 1, caret: CaretTarget) => {
      const sibling = getBlocks()[index + direction];
      return sibling ? focusNow(sibling.id, caret) : false;
    },
    [getBlocks, focusNow],
  );

  const handleDividerKeyDown = useCallback(
    (block: Block, index: number, event: KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case 'Backspace':
        case 'Delete': {
          event.preventDefault();
          const moved = focusSibling(index, -1, 'end') || focusSibling(index, 1, 'start');
          removeBlock(pageId, block.id);
          if (!moved) requestFocus(insertBlock(pageId, null), 'start');
          break;
        }
        case 'Enter':
          event.preventDefault();
          requestFocus(insertBlock(pageId, block.id), 'start');
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!focusSibling(index, -1, 'end')) onExitTop?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusSibling(index, 1, 'start');
          break;
      }
    },
    [focusSibling, insertBlock, onExitTop, pageId, removeBlock, requestFocus],
  );

  const handleKeyDown = useCallback(
    (block: Block, event: KeyboardEvent<HTMLElement>) => {
      const index = getBlocks().findIndex((item) => item.id === block.id);
      if (index === -1 || event.nativeEvent.isComposing) return;
      if (handleSlashKeyDown(block, event)) return;

      const target = event.currentTarget;
      if (!(target instanceof HTMLTextAreaElement)) {
        handleDividerKeyDown(block, index, event);
        return;
      }

      const collapsed = target.selectionStart === target.selectionEnd;

      switch (event.key) {
        case 'Enter': {
          if (event.shiftKey) return; // soft line break
          if (block.type === 'code' && !(event.ctrlKey || event.metaKey)) return;
          event.preventDefault();
          if (block.text === '' && EXIT_ON_EMPTY_ENTER.has(block.type)) {
            changeBlockType(pageId, block.id, 'paragraph');
            return;
          }
          const caret = block.type === 'code' ? block.text.length : target.selectionStart;
          requestFocus(splitBlock(pageId, block.id, caret), 'start');
          return;
        }

        case 'Backspace': {
          if (!collapsed || !isCaretAtStart(target)) return;
          event.preventDefault();
          if (block.type !== 'paragraph') {
            changeBlockType(pageId, block.id, 'paragraph');
            return;
          }
          const previous = getBlocks()[index - 1];
          if (!previous) {
            if (block.text === '' && getBlocks().length > 1) {
              focusSibling(index, 1, 'start');
              removeBlock(pageId, block.id);
            }
            return;
          }
          if (block.text === '') {
            removeBlock(pageId, block.id);
            requestFocus(previous.id, 'end');
            return;
          }
          if (previous.type === 'divider') {
            mergeWithPrevious(pageId, block.id);
            requestFocus(block.id, 'start');
            return;
          }
          const caret = previous.text.length;
          mergeWithPrevious(pageId, block.id);
          requestFocus(previous.id, caret);
          return;
        }

        case 'ArrowUp':
          if (event.shiftKey || !isCaretOnFirstLine(target)) return;
          event.preventDefault();
          if (!focusSibling(index, -1, 'end')) onExitTop?.();
          return;

        case 'ArrowDown':
          if (event.shiftKey || !isCaretOnLastLine(target)) return;
          if (focusSibling(index, 1, 'start')) event.preventDefault();
          return;

        case 'ArrowLeft':
          if (event.shiftKey || !collapsed || !isCaretAtStart(target)) return;
          if (focusSibling(index, -1, 'end')) event.preventDefault();
          return;

        case 'ArrowRight':
          if (event.shiftKey || !collapsed || target.selectionEnd !== target.value.length) return;
          if (focusSibling(index, 1, 'start')) event.preventDefault();
          return;

        case 'Tab':
          if (block.type !== 'code') return;
          event.preventDefault();
          target.setRangeText('  ', target.selectionStart, target.selectionEnd, 'end');
          updateBlockText(pageId, block.id, target.value);
          return;
      }
    },
    [
      changeBlockType,
      focusSibling,
      getBlocks,
      handleDividerKeyDown,
      handleSlashKeyDown,
      mergeWithPrevious,
      onExitTop,
      pageId,
      removeBlock,
      requestFocus,
      splitBlock,
      updateBlockText,
    ],
  );

  const dnd = useBlockDnd(pageId);
  const blockIds = useMemo(() => page.blocks.map((block) => block.id), [page.blocks]);

  const handleInsertBelow = useCallback(
    (block: Block) => requestFocus(insertBlock(pageId, block.id), 'start'),
    [insertBlock, pageId, requestFocus],
  );

  const appendParagraph = () => {
    const last = page.blocks[page.blocks.length - 1];
    if (last && last.type === 'paragraph' && last.text === '') {
      focusNow(last.id, 'end');
      return;
    }
    requestFocus(insertBlock(pageId, last?.id ?? null), 'start');
  };

  return (
    <div className={styles.editor}>
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        accessibility={{
          announcements: dnd.announcements,
          screenReaderInstructions: dnd.screenReaderInstructions,
        }}
        onDragStart={closeSlashMenu}
        onDragEnd={dnd.handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {page.blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              block={block}
              listNumber={block.type === 'numbered' ? getListNumber(page.blocks, index) : 0}
              registerRef={registerRef}
              onTextChange={handleTextChange}
              onToggleTodo={handleToggleTodo}
              onKeyDown={handleKeyDown}
              onInsertBelow={handleInsertBelow}
              onBlur={closeSlashMenu}
              slashMenu={
                slash.openBlockId === block.id
                  ? { listId: slash.menuId, activeOptionId: slash.activeOptionId }
                  : undefined
              }
            />
          ))}
        </SortableContext>
      </DndContext>
      {slash.openBlockId && (
        <SlashMenu
          id={slash.menuId}
          items={slash.items}
          activeIndex={slash.activeIndex}
          anchor={slash.anchor}
          onSelect={slash.select}
          onHover={slash.setActiveIndex}
        />
      )}
      <button
        type="button"
        className={styles.tail}
        onClick={appendParagraph}
        aria-label={t('addBlockAtEnd')}
      >
        {page.blocks.length === 0 && <span className={styles.tailHint}>{t('startWriting')}</span>}
      </button>
    </div>
  );
}
