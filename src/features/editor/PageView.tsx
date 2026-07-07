import type { Page } from '../workspace/model/types';
import { PageTitle } from './PageTitle';
import styles from './PageView.module.css';

interface PageViewProps {
  page: Page;
}

export function PageView({ page }: PageViewProps) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {page.icon}
        </span>
        <h1 className="visually-hidden">{page.title.trim() || 'Sem título'}</h1>
        <PageTitle pageId={page.id} title={page.title} />
      </header>
    </article>
  );
}
