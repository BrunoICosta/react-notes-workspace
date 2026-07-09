import { useShallow } from 'zustand/react/shallow';
import { getFavoriteIds } from '../workspace/model/tree';
import { pageTitle } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import sidebarStyles from './Sidebar.module.css';
import styles from './PageTree.module.css';

export function FavoritesList() {
  const favorites = useWorkspaceStore(
    useShallow((state) => getFavoriteIds(state).map((id) => state.pages[id])),
  );
  const activePageId = useWorkspaceStore((state) => state.activePageId);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);

  if (favorites.length === 0) return null;

  return (
    <nav className={sidebarStyles.section} aria-labelledby="sidebar-favorites-heading">
      <h2 id="sidebar-favorites-heading" className={sidebarStyles.sectionTitle}>
        Favoritos
      </h2>
      <ul className={styles.list}>
        {favorites.map((page) => (
          <li key={page.id}>
            <div className={styles.row} data-active={page.id === activePageId || undefined}>
              <button
                type="button"
                className={styles.link}
                onClick={() => setActivePage(page.id)}
                aria-current={page.id === activePageId ? 'page' : undefined}
              >
                <span className={styles.icon} aria-hidden="true">
                  {page.icon}
                </span>
                <span className={styles.title}>{pageTitle(page)}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
