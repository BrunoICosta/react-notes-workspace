import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, type MenuItem } from '../../shared/ui/DropdownMenu';
import { Icon } from '../../shared/ui/Icon';
import { useUiStore } from '../layout/uiStore';
import { canIndent, canOutdent } from '../workspace/model/tree';
import { pageTitle, usePage } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { RenameInput } from './RenameInput';
import styles from './PageTree.module.css';

interface PageTreeItemProps {
  pageId: string;
  depth: number;
}

export function PageTreeItem({ pageId, depth }: PageTreeItemProps) {
  const page = usePage(pageId);
  const isActive = useWorkspaceStore((state) => state.activePageId === pageId);
  const indentable = useWorkspaceStore((state) => canIndent(state, pageId));
  const outdentable = useWorkspaceStore((state) => canOutdent(state, pageId));
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const toggleCollapsed = useWorkspaceStore((state) => state.toggleCollapsed);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const toggleFavorite = useWorkspaceStore((state) => state.toggleFavorite);
  const indentPage = useWorkspaceStore((state) => state.indentPage);
  const outdentPage = useWorkspaceStore((state) => state.outdentPage);
  const requestDeletePage = useUiStore((state) => state.requestDeletePage);
  const [renaming, setRenaming] = useState(false);
  const { t } = useTranslation('workspace');

  if (!page) return null;

  const title = pageTitle(page);
  const hasChildren = page.childIds.length > 0;
  const expanded = hasChildren && !page.collapsed;

  const menuItems: MenuItem[] = [
    { id: 'rename', label: t('actions.rename'), icon: 'pencil', onSelect: () => setRenaming(true) },
    {
      id: 'subpage',
      label: t('actions.addSubpage'),
      icon: 'plus',
      onSelect: () => createPage({ parentId: pageId }),
    },
    {
      id: 'favorite',
      label: page.favorite ? t('actions.removeFavorite') : t('actions.addFavorite'),
      icon: 'star',
      onSelect: () => toggleFavorite(pageId),
    },
    {
      id: 'indent',
      label: t('actions.indent'),
      icon: 'indent',
      disabled: !indentable,
      onSelect: () => indentPage(pageId),
    },
    {
      id: 'outdent',
      label: t('actions.outdent'),
      icon: 'outdent',
      disabled: !outdentable,
      onSelect: () => outdentPage(pageId),
    },
    {
      id: 'delete',
      label: t('actions.delete'),
      icon: 'trash',
      danger: true,
      onSelect: () => requestDeletePage(pageId),
    },
  ];

  return (
    <li className={styles.item}>
      <div
        className={styles.row}
        data-active={isActive || undefined}
        style={{ '--depth': depth } as CSSProperties}
      >
        <button
          type="button"
          className={styles.toggle}
          onClick={() => toggleCollapsed(pageId)}
          aria-label={expanded ? t('tree.collapse', { title }) : t('tree.expand', { title })}
          aria-expanded={hasChildren ? expanded : undefined}
          disabled={!hasChildren}
          data-expanded={expanded || undefined}
        >
          <Icon name="chevronRight" size={14} />
        </button>

        {renaming ? (
          <RenameInput
            initialValue={page.title}
            onSubmit={(value) => {
              renamePage(pageId, value);
              setRenaming(false);
            }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <button
            type="button"
            className={styles.link}
            onClick={() => setActivePage(pageId)}
            onDoubleClick={() => setRenaming(true)}
            onKeyDown={(event) => {
              if (event.key === 'F2') {
                event.preventDefault();
                setRenaming(true);
              }
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              {page.icon}
            </span>
            <span className={styles.title} data-untitled={!page.title.trim() || undefined}>
              {title}
            </span>
          </button>
        )}

        {!renaming && (
          <div className={styles.actions}>
            <DropdownMenu
              label={t('tree.actions', { title })}
              items={menuItems}
              triggerClassName={styles.action}
              triggerContent={<Icon name="more" size={14} />}
            />
            <button
              type="button"
              className={styles.action}
              onClick={() => createPage({ parentId: pageId })}
              aria-label={t('tree.addSubpageTo', { title })}
              title={t('actions.addSubpage')}
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <ul className={styles.list}>
          {page.childIds.map((childId) => (
            <PageTreeItem key={childId} pageId={childId} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
