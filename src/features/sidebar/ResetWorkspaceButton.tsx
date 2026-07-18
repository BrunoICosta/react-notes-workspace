import { useState } from 'react';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { Icon } from '../../shared/ui/Icon';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './Sidebar.module.css';

export function ResetWorkspaceButton() {
  const [confirming, setConfirming] = useState(false);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);

  return (
    <>
      <button type="button" className={styles.footerButton} onClick={() => setConfirming(true)}>
        <Icon name="reset" size={14} />
        Restaurar exemplos
      </button>
      <ConfirmDialog
        open={confirming}
        tone="danger"
        title="Restaurar as páginas de exemplo?"
        description={
          <p>
            Todas as páginas atuais serão substituídas pelas páginas de boas-vindas. Essa ação não
            pode ser desfeita.
          </p>
        }
        confirmLabel="Restaurar"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          resetWorkspace();
          setConfirming(false);
        }}
      />
    </>
  );
}
