import { DropdownMenu } from '../../shared/ui/DropdownMenu';
import { Icon } from '../../shared/ui/Icon';
import type { Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { Breadcrumbs } from './Breadcrumbs';
import { useUiStore } from './uiStore';
import styles from './Topbar.module.css';

interface TopbarProps {
  page: Page | null;
}

const editedFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function Topbar({ page }: TopbarProps) {
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const requestDeletePage = useUiStore((state) => state.requestDeletePage);

  return (
    <header className={styles.topbar}>
      <div className={styles.current}>{page && <Breadcrumbs page={page} />}</div>
      {page && (
        <div className={styles.actions}>
          <span className={styles.edited}>
            Editado em{' '}
            <time dateTime={new Date(page.updatedAt).toISOString()}>
              {editedFormatter.format(page.updatedAt)}
            </time>
          </span>
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={page.favorite}
            aria-label="Favorito"
            title={page.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={() => toggleFavorite(page.id)}
            data-favorite={page.favorite || undefined}
          >
            <Icon name="star" filled={page.favorite} />
          </button>
          <DropdownMenu
            label="Mais ações da página"
            triggerClassName={styles.iconButton}
            triggerContent={<Icon name="more" />}
            items={[
              {
                id: 'subpage',
                label: 'Adicionar subpágina',
                icon: 'plus',
                onSelect: () => createPage({ parentId: page.id }),
              },
              {
                id: 'delete',
                label: 'Excluir página',
                icon: 'trash',
                danger: true,
                onSelect: () => requestDeletePage(page.id),
              },
            ]}
          />
        </div>
      )}
    </header>
  );
}
