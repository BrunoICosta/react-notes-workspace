import { useCallback, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { getListNumber } from '../workspace/model/blocks';
import type { Block, Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { BlockRow } from './BlockRow';
import { focusWithCaret, type CaretTarget } from './caret';
import styles from './BlockEditor.module.css';

interface BlockEditorProps {
  page: Page;
}

interface FocusRequest {
  blockId: string;
  caret: CaretTarget;
}

export function BlockEditor({ page }: BlockEditorProps) {
  const pageId = page.id;
  const elements = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<FocusRequest | null>(null);

  const insertBlock = useWorkspaceStore((state) => state.insertBlock);
  const updateBlockText = useWorkspaceStore((state) => state.updateBlockText);
  const toggleTodo = useWorkspaceStore((state) => state.toggleTodo);

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

  const requestFocus = useCallback((blockId: string, caret: CaretTarget) => {
    const element = elements.current.get(blockId);
    if (element) focusWithCaret(element, caret);
    else pendingFocus.current = { blockId, caret };
  }, []);

  const handleTextChange = useCallback(
    (block: Block, text: string) => updateBlockText(pageId, block.id, text),
    [pageId, updateBlockText],
  );

  const handleToggleTodo = useCallback(
    (block: Block) => toggleTodo(pageId, block.id),
    [pageId, toggleTodo],
  );

  const handleKeyDown = useCallback(
    (block: Block, event: KeyboardEvent<HTMLElement>) => {
      const target = event.currentTarget;
      if (block.type === 'code' && event.key === 'Tab' && target instanceof HTMLTextAreaElement) {
        event.preventDefault();
        target.setRangeText('  ', target.selectionStart, target.selectionEnd, 'end');
        updateBlockText(pageId, block.id, target.value);
      }
    },
    [pageId, updateBlockText],
  );

  const appendParagraph = () => {
    const last = page.blocks[page.blocks.length - 1];
    if (last && last.type === 'paragraph' && last.text === '') {
      requestFocus(last.id, 'end');
      return;
    }
    requestFocus(insertBlock(pageId, last?.id ?? null), 'start');
  };

  return (
    <div className={styles.editor}>
      {page.blocks.map((block, index) => (
        <BlockRow
          key={block.id}
          block={block}
          listNumber={block.type === 'numbered' ? getListNumber(page.blocks, index) : 0}
          registerRef={registerRef}
          onTextChange={handleTextChange}
          onToggleTodo={handleToggleTodo}
          onKeyDown={handleKeyDown}
        />
      ))}
      <button
        type="button"
        className={styles.tail}
        onClick={appendParagraph}
        aria-label="Adicionar bloco no fim da página"
      >
        {page.blocks.length === 0 && (
          <span className={styles.tailHint}>Clique para começar a escrever…</span>
        )}
      </button>
    </div>
  );
}
