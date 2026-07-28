import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { getAncestors } from '../workspace/model/tree';
import type { Page } from '../workspace/model/types';
import { pageTitle } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
  page: Page;
}

/** Above this many ancestors the middle of the trail collapses into "…". */
const MAX_VISIBLE_ANCESTORS = 3;

export function Breadcrumbs({ page }: BreadcrumbsProps) {
  const ancestors = useWorkspaceStore(useShallow((state) => getAncestors(state, page.id)));
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const { t } = useTranslation('workspace');

  const collapsed = ancestors.length > MAX_VISIBLE_ANCESTORS;
  const visible = collapsed ? [ancestors[0], ...ancestors.slice(-2)] : ancestors;

  return (
    <nav aria-label={t('topbar.breadcrumbs')} className={styles.nav}>
      <ol className={styles.list}>
        {visible.map((ancestor, index) => (
          <Fragment key={ancestor.id}>
            {collapsed && index === 1 && (
              <li className={styles.item} aria-hidden="true">
                <span className={styles.ellipsis}>…</span>
                <span className={styles.separator}>/</span>
              </li>
            )}
            <li className={styles.item}>
              <button
                type="button"
                className={styles.crumb}
                onClick={() => setActivePage(ancestor.id)}
              >
                <span aria-hidden="true">{ancestor.icon}</span>
                <span className={styles.label}>{pageTitle(ancestor)}</span>
              </button>
              <span className={styles.separator} aria-hidden="true">
                /
              </span>
            </li>
          </Fragment>
        ))}
        <li className={styles.item}>
          <span className={styles.crumb} aria-current="page" data-current>
            <span aria-hidden="true">{page.icon}</span>
            <span className={styles.label}>{pageTitle(page)}</span>
          </span>
        </li>
      </ol>
    </nav>
  );
}
