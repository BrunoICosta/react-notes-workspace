import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { Icon } from '../../shared/ui/Icon';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './Sidebar.module.css';

export function ResetWorkspaceButton() {
  const [confirming, setConfirming] = useState(false);
  const { t } = useTranslation('workspace');
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  return (
    <>
      <button type="button" className={styles.footerButton} onClick={() => setConfirming(true)}>
        <Icon name="reset" size={14} />
        {t('reset.button')}
      </button>
      <ConfirmDialog
        open={confirming}
        tone="danger"
        title={t('reset.title')}
        description={<p>{t('reset.description')}</p>}
        confirmLabel={t('reset.confirm')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          resetWorkspace();
          setConfirming(false);
        }}
      />
    </>
  );
}
