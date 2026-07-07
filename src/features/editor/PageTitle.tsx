import { useRef, type KeyboardEvent } from 'react';
import { useAutoResize } from '../../shared/hooks/useAutoResize';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './PageView.module.css';

interface PageTitleProps {
  pageId: string;
  title: string;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function PageTitle({ pageId, title, onKeyDown }: PageTitleProps) {
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResize(ref, title);

  return (
    <textarea
      ref={ref}
      className={styles.title}
      value={title}
      rows={1}
      placeholder="Sem título"
      aria-label="Título da página"
      maxLength={200}
      onChange={(event) => renamePage(pageId, event.target.value.replace(/\n/g, ' '))}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.preventDefault();
        onKeyDown?.(event);
      }}
    />
  );
}
