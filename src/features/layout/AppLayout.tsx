import { useCallback, useEffect, useRef } from 'react';
import { useHotkey } from '../../shared/hooks/useHotkey';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import { PageView } from '../editor/PageView';
import { QuickSearch } from '../search/QuickSearch';
import { DeletePageDialog } from '../sidebar/DeletePageDialog';
import { Sidebar } from '../sidebar/Sidebar';
import { useActivePage } from '../workspace/store/selectors';
import { EmptyWorkspace } from './EmptyWorkspace';
import { Topbar } from './Topbar';
import { useUiStore } from './uiStore';
import styles from './AppLayout.module.css';

const MOBILE_QUERY = '(max-width: 768px)';

export function AppLayout() {
  const activePage = useActivePage();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const pendingDeletePageId = useUiStore((state) => state.pendingDeletePageId);
  const cancelDeletePage = useUiStore((state) => state.cancelDeletePage);
  const toggleSearch = useUiStore((state) => state.toggleSearch);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useHotkey('k', toggleSearch, { mod: true });

  const drawerOpen = isMobile && sidebarOpen;

  const closeDrawer = useCallback(() => {
    closeSidebar();
    menuButtonRef.current?.focus();
  }, [closeSidebar]);

  // Navigating to another page (or creating one) closes the drawer on mobile.
  const activePageId = activePage?.id;
  useEffect(() => {
    closeSidebar();
  }, [activePageId, closeSidebar]);

  return (
    <div className={styles.layout}>
      <a className={styles.skipLink} href="#main-content">
        Pular para o conteúdo
      </a>
      <Sidebar mobile={isMobile} open={drawerOpen} onClose={closeDrawer} />
      {drawerOpen && <div className={styles.backdrop} onClick={closeDrawer} aria-hidden="true" />}
      <div className={styles.main} inert={drawerOpen}>
        <Topbar page={activePage} showMenuButton={isMobile} menuButtonRef={menuButtonRef} />
        <main id="main-content" className={styles.content} tabIndex={-1}>
          {activePage ? <PageView key={activePage.id} page={activePage} /> : <EmptyWorkspace />}
        </main>
      </div>
      <QuickSearch />
      <DeletePageDialog pageId={pendingDeletePageId} onClose={cancelDeletePage} />
    </div>
  );
}
