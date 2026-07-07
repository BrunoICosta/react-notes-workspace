import { PageView } from '../editor/PageView';
import { DeletePageDialog } from '../sidebar/DeletePageDialog';
import { Sidebar } from '../sidebar/Sidebar';
import { useActivePage } from '../workspace/store/selectors';
import { EmptyWorkspace } from './EmptyWorkspace';
import { Topbar } from './Topbar';
import { useUiStore } from './uiStore';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const activePage = useActivePage();
  const pendingDeletePageId = useUiStore((state) => state.pendingDeletePageId);
  const cancelDeletePage = useUiStore((state) => state.cancelDeletePage);

  return (
    <div className={styles.layout}>
      <a className={styles.skipLink} href="#main-content">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className={styles.main}>
        <Topbar page={activePage} />
        <main id="main-content" className={styles.content} tabIndex={-1}>
          {activePage ? <PageView key={activePage.id} page={activePage} /> : <EmptyWorkspace />}
        </main>
      </div>
      <DeletePageDialog pageId={pendingDeletePageId} onClose={cancelDeletePage} />
    </div>
  );
}
