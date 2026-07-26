import type { RefObject } from 'react';
import { DropdownMenu } from '../../shared/ui/DropdownMenu';
import { Icon } from '../../shared/ui/Icon';
import type { Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { LanguageSwitcher } from '../preferences/LanguageSwitcher';
import { SIDEBAR_ID } from './uiStore';
import { Breadcrumbs } from './Breadcrumbs';
import { useUiStore } from './uiStore';
import styles from './Topbar.module.css';

interface TopbarProps {
  page: Page | null;
  /** Small screens: shows the button that opens the sidebar drawer. */
  showMenuButton?: boolean;
  menuButtonRef?: RefObject<HTMLButtonElement | null>;
}

const editedFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function Topbar({ page, showMenuButton = false, menuButtonRef }: TopbarProps) {
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const requestDeletePage = useUiStore((state) => state.requestDeletePage);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const openSearch = useUiStore((state) => state.openSearch);

  return (
    <header className={styles.topbar}>
      {showMenuButton && (
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          onClick={openSidebar}
          aria-label="Abrir barra lateral"
          aria-controls={SIDEBAR_ID}
          aria-expanded={sidebarOpen}
        >
          <Icon name="menu" />
        </button>
      )}
      <div className={styles.current}>{page && <Breadcrumbs page={page} />}</div>
      {page && (
        <div className={styles.actions}>
          {showMenuButton && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={openSearch}
              aria-label="Buscar"
            >
              <Icon name="search" />
            </button>
          )}
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
      <LanguageSwitcher />
    </header>
  );
}
