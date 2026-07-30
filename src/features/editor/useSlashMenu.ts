import { useCallback, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Block } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import {
  detectSlashTrigger,
  filterBlockTypes,
  slashOptionId,
  type BlockMenuItem,
} from './blockMenu';
import { normalizeLanguage } from '../../i18n';
import type { CaretTarget } from './caret';

interface SlashState {
  blockId: string;
  /** Index of the "/" character inside the block text. */
  start: number;
  query: string;
  activeIndex: number;
  /** Element the floating menu is anchored to. */
  anchor: HTMLElement;
}

interface UseSlashMenuOptions {
  pageId: string;
  requestFocus: (blockId: string, caret: CaretTarget) => void;
}

const MAX_QUERY_LENGTH = 30;

/**
 * State machine behind the "/" command menu: opens when "/" is typed at a word
 * boundary, filters while typing, and converts the block when an option is chosen.
 */
export function useSlashMenu({ pageId, requestFocus }: UseSlashMenuOptions) {
  const [state, setState] = useState<SlashState | null>(null);
  const menuId = useId();
  const { i18n } = useTranslation();
  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  const items = useMemo(
    () => (state ? filterBlockTypes(state.query, language) : []),
    [state, language],
  );

  const close = useCallback(() => setState(null), []);

  const setActiveIndex = useCallback(
    (activeIndex: number) => setState((current) => (current ? { ...current, activeIndex } : null)),
    [],
  );

  /** Call on every text change of a block, with its new text and the edited field. */
  const trackInput = useCallback((block: Block, nextText: string, element: HTMLTextAreaElement) => {
    const caret = element.selectionStart;
    setState((current) => {
      if (current && current.blockId === block.id) {
        if (caret <= current.start || nextText[current.start] !== '/') return null;
        const query = nextText.slice(current.start + 1, caret);
        if (query.includes('\n') || query.length > MAX_QUERY_LENGTH) return null;
        if (/\s$/.test(query) && filterBlockTypes(query).length === 0) return null;
        return { ...current, query, activeIndex: 0 };
      }
      if (block.type === 'code') return null;
      const start = detectSlashTrigger(block.text, nextText, caret);
      return start === null
        ? null
        : { blockId: block.id, start, query: '', activeIndex: 0, anchor: element };
    });
  }, []);

  const select = useCallback(
    (item: BlockMenuItem) => {
      if (!state) return;
      const store = useWorkspaceStore.getState();
      const block = store.pages[pageId]?.blocks.find((entry) => entry.id === state.blockId);
      setState(null);
      if (!block) return;

      const end = state.start + 1 + state.query.length;
      const text = block.text.slice(0, state.start) + block.text.slice(end);

      if (item.type === 'divider') {
        if (text.trim() === '') {
          store.changeBlockType(pageId, block.id, 'divider');
          requestFocus(store.insertBlock(pageId, block.id), 'start');
        } else {
          store.updateBlockText(pageId, block.id, text);
          const dividerId = store.insertBlock(pageId, block.id, 'divider');
          requestFocus(store.insertBlock(pageId, dividerId), 'start');
        }
        return;
      }

      store.updateBlockText(pageId, block.id, text);
      store.changeBlockType(pageId, block.id, item.type);
      requestFocus(block.id, state.start);
    },
    [pageId, requestFocus, state],
  );

  /** Handles navigation keys while the menu is open. Returns true when consumed. */
  const handleKeyDown = useCallback(
    (block: Block, event: KeyboardEvent<HTMLElement>): boolean => {
      if (!state || state.blockId !== block.id) return false;
      const count = items.length;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (count > 0) setActiveIndex((state.activeIndex + 1) % count);
          return true;
        case 'ArrowUp':
          event.preventDefault();
          if (count > 0) setActiveIndex((state.activeIndex - 1 + count) % count);
          return true;
        case 'Enter':
        case 'Tab':
          if (count === 0) {
            close();
            return false;
          }
          event.preventDefault();
          select(items[Math.min(state.activeIndex, count - 1)]);
          return true;
        case 'Escape':
          event.preventDefault();
          close();
          return true;
        default:
          return false;
      }
    },
    [close, items, select, setActiveIndex, state],
  );

  const activeOptionId =
    state && items.length > 0 ? slashOptionId(menuId, state.activeIndex) : undefined;

  return {
    openBlockId: state?.blockId ?? null,
    anchor: state?.anchor ?? null,
    activeIndex: state?.activeIndex ?? 0,
    activeOptionId,
    items,
    menuId,
    trackInput,
    handleKeyDown,
    select,
    setActiveIndex,
    close,
  };
}
