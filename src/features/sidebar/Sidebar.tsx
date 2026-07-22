import { useEffect, useRef } from 'react';
import { MOD_KEY_LABEL } from '../../shared/hooks/useHotkey';
import { Icon } from '../../shared/ui/Icon';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';
import { SIDEBAR_ID, useUiStore } from '../layout/uiStore';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { FavoritesList } from './FavoritesList';
import { PageTree } from './PageTree';
import { ResetWorkspaceButton } from './ResetWorkspaceButton';
import styles from './Sidebar.module.css';

interface SidebarProps {
  /** On small screens the sidebar is an off-canvas drawer. */
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, open = false, onClose }: SidebarProps) {
  const createPage = useWorkspaceStore((state) => state.createPage);
  const openSearch = useUiStore((state) => state.openSearch);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hidden = mobile && !open;

  useEffect(() => {
    if (mobile && open) closeButtonRef.current?.focus();
  }, [mobile, open]);

  return (
    <aside
      id={SIDEBAR_ID}
      className={styles.sidebar}
      aria-label="Barra lateral"
      data-mobile={mobile || undefined}
      data-open={open || undefined}
      inert={hidden}
      onKeyDown={(event) => {
        if (mobile && event.key === 'Escape' && !event.defaultPrevented) onClose?.();
      }}
    >
      <header className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          N
        </span>
        <span className={styles.workspaceName}>Notes Workspace</span>
        {mobile && (
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar barra lateral"
          >
            <Icon name="close" />
          </button>
        )}
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
