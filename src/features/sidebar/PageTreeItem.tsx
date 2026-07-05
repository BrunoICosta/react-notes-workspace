import type { CSSProperties } from 'react';
import { Icon } from '../../shared/ui/Icon';
import { pageTitle, usePage } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './PageTree.module.css';

interface PageTreeItemProps {
  pageId: string;
  depth: number;
}

export function PageTreeItem({ pageId, depth }: PageTreeItemProps) {
  const page = usePage(pageId);
  const isActive = useWorkspaceStore((state) => state.activePageId === pageId);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const toggleCollapsed = useWorkspaceStore((state) => state.toggleCollapsed);
  const createPage = useWorkspaceStore((state) => state.createPage);

  if (!page) return null;

  const title = pageTitle(page);
  const hasChildren = page.childIds.length > 0;
  const expanded = hasChildren && !page.collapsed;

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
          aria-label={expanded ? `Recolher ${title}` : `Expandir ${title}`}
          aria-expanded={hasChildren ? expanded : undefined}
          disabled={!hasChildren}
          data-expanded={expanded || undefined}
        >
          <Icon name="chevronRight" size={14} />
        </button>

        <button
          type="button"
          className={styles.link}
          onClick={() => setActivePage(pageId)}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            {page.icon}
          </span>
          <span className={styles.title} data-untitled={!page.title.trim() || undefined}>
            {title}
          </span>
        </button>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            onClick={() => createPage({ parentId: pageId })}
            aria-label={`Adicionar subpágina em ${title}`}
            title="Adicionar subpágina"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
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
