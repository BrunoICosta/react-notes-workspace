import type { KeyboardEvent, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoResize } from '../../shared/hooks/useAutoResize';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './PageView.module.css';

interface PageTitleProps {
  pageId: string;
  title: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** Enter or ArrowDown on the last line moves into the page body. */
  onExitBottom: () => void;
}

export function PageTitle({ pageId, title, inputRef, onExitBottom }: PageTitleProps) {
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const { t } = useTranslation(['editor', 'common']);
  useAutoResize(inputRef, title);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    const element = event.currentTarget;
    const atEnd = element.selectionEnd === element.value.length;
    if (event.key === 'Enter' || (event.key === 'ArrowDown' && atEnd)) {
      event.preventDefault();
      onExitBottom();
    }
  };

  return (
    <textarea
      ref={inputRef}
      className={styles.title}
      value={title}
      rows={1}
      placeholder={t('common:untitled')}
      aria-label={t('pageTitle')}
      maxLength={200}
      onChange={(event) => renamePage(pageId, event.target.value.replace(/\n/g, ' '))}
      onKeyDown={handleKeyDown}
    />
  );
}
