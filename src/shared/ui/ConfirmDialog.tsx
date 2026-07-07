import { useId, type ReactNode } from 'react';
import { Modal } from './Modal';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal open={open} onClose={onCancel} labelledBy={titleId} describedBy={descriptionId}>
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onCancel} data-autofocus>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={styles.button}
          data-variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
