import type { Page } from '../workspace/model/types';
import { pageTitle } from '../workspace/store/selectors';
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
        <h1 className={styles.title}>{pageTitle(page)}</h1>
      </header>
    </article>
  );
}
