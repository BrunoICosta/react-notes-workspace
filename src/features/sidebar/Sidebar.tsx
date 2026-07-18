import { MOD_KEY_LABEL } from '../../shared/hooks/useHotkey';
import { Icon } from '../../shared/ui/Icon';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';
import { useUiStore } from '../layout/uiStore';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { FavoritesList } from './FavoritesList';
import { PageTree } from './PageTree';
import { ResetWorkspaceButton } from './ResetWorkspaceButton';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const createPage = useWorkspaceStore((state) => state.createPage);
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <aside className={styles.sidebar} aria-label="Barra lateral">
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          N
        </span>
        <span className={styles.workspaceName}>Notes Workspace</span>
      </header>

      <div className={styles.quickActions}>
        <button
          type="button"
          className={styles.quickAction}
          onClick={openSearch}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Icon name="search" />
          <span>Buscar</span>
          <kbd className={styles.kbd}>{MOD_KEY_LABEL} K</kbd>
        </button>
        <button type="button" className={styles.quickAction} onClick={() => createPage()}>
          <Icon name="plus" />
          <span>Nova página</span>
        </button>
      </div>

      <div className={styles.scroll}>
        <FavoritesList />
        <nav className={styles.section} aria-labelledby="sidebar-pages-heading">
          <h2 id="sidebar-pages-heading" className={styles.sectionTitle}>
            Páginas
          </h2>
          <PageTree />
        </nav>
      </div>

      <footer className={styles.footer}>
        <ResetWorkspaceButton />
        <ThemeToggle />
      </footer>
    </aside>
  );
}
