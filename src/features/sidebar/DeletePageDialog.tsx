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

  if (!page) return null;

  const description =
    descendantCount === 0
      ? 'A página será excluída permanentemente. Essa ação não pode ser desfeita.'
      : `A página e ${descendantCount === 1 ? 'sua subpágina' : `suas ${descendantCount} subpáginas`} serão excluídas permanentemente. Essa ação não pode ser desfeita.`;

  return (
    <ConfirmDialog
      open
      tone="danger"
      title={`Excluir “${pageTitle(page)}”?`}
      description={<p>{description}</p>}
      confirmLabel="Excluir"
      onCancel={onClose}
      onConfirm={() => {
        deletePage(page.id);
        onClose();
      }}
    />
  );
}
