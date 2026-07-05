import { pageTitle } from '../workspace/store/selectors';
import type { Page } from '../workspace/model/types';
import styles from './Topbar.module.css';

interface TopbarProps {
  page: Page | null;
}

export function Topbar({ page }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.current}>
        {page && (
          <>
            <span aria-hidden="true">{page.icon}</span>
            <span className={styles.title}>{pageTitle(page)}</span>
          </>
        )}
      </div>
    </header>
  );
}
