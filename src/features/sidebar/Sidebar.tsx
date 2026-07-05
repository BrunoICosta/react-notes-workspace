import { Icon } from '../../shared/ui/Icon';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { PageTree } from './PageTree';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const createPage = useWorkspaceStore((state) => state.createPage);

  return (
    <aside className={styles.sidebar} aria-label="Barra lateral">
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          N
        </span>
        <span className={styles.workspaceName}>Notes Workspace</span>
      </header>

      <div className={styles.quickActions}>
        <button type="button" className={styles.quickAction} onClick={() => createPage()}>
          <Icon name="plus" />
          <span>Nova página</span>
        </button>
      </div>

      <div className={styles.scroll}>
        <nav className={styles.section} aria-labelledby="sidebar-pages-heading">
          <h2 id="sidebar-pages-heading" className={styles.sectionTitle}>
            Páginas
          </h2>
          <PageTree />
        </nav>
      </div>

      <footer className={styles.footer}>
        <ThemeToggle />
      </footer>
    </aside>
  );
}
