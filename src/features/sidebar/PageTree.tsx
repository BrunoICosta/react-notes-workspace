import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { PageTreeItem } from './PageTreeItem';
import styles from './PageTree.module.css';

export function PageTree() {
  const rootIds = useWorkspaceStore((state) => state.rootIds);
  const { t } = useTranslation('workspace');

  if (rootIds.length === 0) {
    return <p className={styles.empty}>{t('sidebar.empty')}</p>;
  }

  return (
    <ul className={styles.list}>
      {rootIds.map((id) => (
        <PageTreeItem key={id} pageId={id} depth={0} />
      ))}
    </ul>
  );
}
