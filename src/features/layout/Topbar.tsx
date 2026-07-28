import { useMemo, type RefObject } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DropdownMenu } from '../../shared/ui/DropdownMenu';
import { Icon } from '../../shared/ui/Icon';
import type { Page } from '../workspace/model/types';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { LanguageSwitcher } from '../preferences/LanguageSwitcher';
import { Breadcrumbs } from './Breadcrumbs';
import { SIDEBAR_ID, useUiStore } from './uiStore';
import styles from './Topbar.module.css';

interface TopbarProps {
  page: Page | null;
  /** Small screens: shows the button that opens the sidebar drawer. */
  showMenuButton?: boolean;
  menuButtonRef?: RefObject<HTMLButtonElement | null>;
}

export function Topbar({ page, showMenuButton = false, menuButtonRef }: TopbarProps) {
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const requestDeletePage = useUiStore((state) => state.requestDeletePage);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const openSearch = useUiStore((state) => state.openSearch);
  const { t, i18n } = useTranslation('workspace');
  const editedFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [i18n.language],
  );

  return (
    <header className={styles.topbar}>
      {showMenuButton && (
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.iconButton}
          onClick={openSidebar}
          aria-label={t('sidebar.open')}
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
              aria-label={t('sidebar.search')}
            >
              <Icon name="search" />
            </button>
          )}
          <span className={styles.edited}>
            <Trans
              t={t}
              i18nKey="topbar.edited"
              values={{ date: editedFormatter.format(page.updatedAt) }}
              components={{ time: <time dateTime={new Date(page.updatedAt).toISOString()} /> }}
            />
          </span>
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={page.favorite}
            aria-label={t('actions.favorite')}
            title={page.favorite ? t('actions.removeFavorite') : t('actions.addFavorite')}
            onClick={() => toggleFavorite(page.id)}
            data-favorite={page.favorite || undefined}
          >
            <Icon name="star" filled={page.favorite} />
          </button>
          <DropdownMenu
            label={t('actions.more')}
            triggerClassName={styles.iconButton}
            triggerContent={<Icon name="more" />}
            items={[
              {
                id: 'subpage',
                label: t('actions.addSubpage'),
                icon: 'plus',
                onSelect: () => createPage({ parentId: page.id }),
              },
              {
                id: 'delete',
                label: t('actions.deletePage'),
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
