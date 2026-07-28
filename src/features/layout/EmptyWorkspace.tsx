import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/ui/Icon';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './EmptyWorkspace.module.css';

export function EmptyWorkspace() {
  const createPage = useWorkspaceStore((state) => state.createPage);
  const hasPages = useWorkspaceStore((state) => state.rootIds.length > 0);
  const { t } = useTranslation('workspace');

  return (
    <section className={styles.empty} aria-labelledby="empty-workspace-title">
      <div className={styles.illustration} aria-hidden="true">
        🗒️
      </div>
      <h1 id="empty-workspace-title" className={styles.title}>
        {hasPages ? t('empty.selectTitle') : t('empty.noPagesTitle')}
      </h1>
      <p className={styles.text}>{hasPages ? t('empty.selectText') : t('empty.noPagesText')}</p>
      <button type="button" className={styles.button} onClick={() => createPage()}>
        <Icon name="plus" />
        {t('empty.create')}
      </button>
    </section>
  );
}
