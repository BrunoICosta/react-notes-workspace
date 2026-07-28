import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { getDescendantIds } from '../workspace/model/tree';
import { pageTitle } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';

interface DeletePageDialogProps {
  pageId: string | null;
  onClose: () => void;
}

export function DeletePageDialog({ pageId, onClose }: DeletePageDialogProps) {
  const page = useWorkspaceStore((state) => (pageId ? state.pages[pageId] : undefined));
  const descendantCount = useWorkspaceStore((state) =>
    pageId ? getDescendantIds(state, pageId).length : 0,
  );
  const deletePage = useWorkspaceStore((state) => state.deletePage);
  const { t } = useTranslation('workspace');

  if (!page) return null;

  const description =
    descendantCount === 0
      ? t('deleteDialog.descriptionNoChildren')
      : t('deleteDialog.description', { count: descendantCount });

  return (
    <ConfirmDialog
      open
      tone="danger"
      title={t('deleteDialog.title', { title: pageTitle(page) })}
      description={<p>{description}</p>}
      confirmLabel={t('deleteDialog.confirm')}
      onCancel={onClose}
      onConfirm={() => {
        deletePage(page.id);
        onClose();
      }}
    />
  );
}
