import { Icon } from '../../shared/ui/Icon';
import type { Page } from '../workspace/model/types';
import { pageTitle } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './Topbar.module.css';

interface TopbarProps {
  page: Page | null;
}

export function Topbar({ page }: TopbarProps) {
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);

  return (
    <header className={styles.topbar}>
      <div className={styles.current}>
        {page && (
          <>
            <span aria-hidden="true">{page.icon}</span>
            <span className={styles.title}>{pageTitle(page)}</span>
          </>
        )}
      </div>
      {page && (
        <div className={styles.actions}>
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
        </div>
      )}
    </header>
  );
}
