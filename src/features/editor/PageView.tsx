import { useEffect, useRef } from 'react';
import type { Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { BlockEditor, type BlockEditorHandle } from './BlockEditor';
import { focusWithCaret } from './caret';
import { EmojiPicker } from './EmojiPicker';
import { PageTitle } from './PageTitle';
import styles from './PageView.module.css';

interface PageViewProps {
  page: Page;
}

function isBlankPage(page: Page): boolean {
  return page.title === '' && page.blocks.every((block) => block.text === '');
}

export function PageView({ page }: PageViewProps) {
  const setPageIcon = useWorkspaceStore((state) => state.setPageIcon);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<BlockEditorHandle>(null);
  const startsBlank = useRef(isBlankPage(page));

  // A brand new page starts with the caret in the title, ready to type.
  useEffect(() => {
    if (startsBlank.current && titleRef.current) titleRef.current.focus();
  }, []);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <EmojiPicker
          value={page.icon}
          onChange={(icon) => setPageIcon(page.id, icon)}
          triggerClassName={styles.icon}
        />
        <h1 className="visually-hidden">{page.title.trim() || 'Sem título'}</h1>
        <PageTitle
          pageId={page.id}
          title={page.title}
          inputRef={titleRef}
          onExitBottom={() => editorRef.current?.focusFirstBlock()}
        />
      </header>
      <BlockEditor
        ref={editorRef}
        page={page}
        onExitTop={() => titleRef.current && focusWithCaret(titleRef.current, 'end')}
      />
    </article>
  );
}
