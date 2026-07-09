import type { Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { EmojiPicker } from './EmojiPicker';
import { PageTitle } from './PageTitle';
import styles from './PageView.module.css';

interface PageViewProps {
  page: Page;
}

export function PageView({ page }: PageViewProps) {
  const setPageIcon = useWorkspaceStore((state) => state.setPageIcon);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <EmojiPicker
          value={page.icon}
          onChange={(icon) => setPageIcon(page.id, icon)}
          triggerClassName={styles.icon}
        />
        <h1 className="visually-hidden">{page.title.trim() || 'Sem título'}</h1>
        <PageTitle pageId={page.id} title={page.title} />
      </header>
    </article>
  );
}
