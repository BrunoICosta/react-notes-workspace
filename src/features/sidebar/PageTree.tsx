import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { PageTreeItem } from './PageTreeItem';
import styles from './PageTree.module.css';

export function PageTree() {
  const rootIds = useWorkspaceStore((state) => state.rootIds);

  if (rootIds.length === 0) {
    return <p className={styles.empty}>Nenhuma página por aqui ainda.</p>;
  }

  return (
    <ul className={styles.list}>
      {rootIds.map((id) => (
        <PageTreeItem key={id} pageId={id} depth={0} />
      ))}
    </ul>
  );
}
