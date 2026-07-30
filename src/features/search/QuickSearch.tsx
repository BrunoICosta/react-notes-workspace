import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../shared/ui/Icon';
import { Modal } from '../../shared/ui/Modal';
import { useUiStore } from '../layout/uiStore';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { searchPages, type SearchResult } from './searchPages';
import styles from './QuickSearch.module.css';

export function QuickSearch() {
  const open = useUiStore((state) => state.searchOpen);
  const closeSearch = useUiStore((state) => state.closeSearch);
  if (!open) return null;
  return <QuickSearchDialog onClose={closeSearch} />;
}

interface QuickSearchDialogProps {
  onClose: () => void;
}

function QuickSearchDialog({ onClose }: QuickSearchDialogProps) {
  const [query, setQuery] = useState('');
  const { t } = useTranslation(['search', 'common']);
  const [activeIndex, setActiveIndex] = useState(0);
  const pages = useWorkspaceStore((state) => state.pages);
  const rootIds = useWorkspaceStore((state) => state.rootIds);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const titleId = useId();
  const listId = useId();

  const results = useMemo(
    () =>
      searchPages({ pages, rootIds, activePageId: null }, query, {
        untitledLabel: t('common:untitled'),
      }),
    [pages, rootIds, query, t],
  );
  const safeIndex = Math.min(activeIndex, Math.max(0, results.length - 1));
  const optionId = (index: number) => `${listId}-${index}`;

  const openResult = (result: SearchResult | undefined) => {
    if (!result) return;
    setActivePage(result.pageId);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length === 0) return;
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((safeIndex + delta + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      openResult(results[safeIndex]);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <Modal open onClose={onClose} labelledBy={titleId} placement="top" className={styles.dialog}>
      <h2 id={titleId} className="visually-hidden">
        {t('title')}
      </h2>
      <div className={styles.inputRow}>
        <Icon name="search" size={18} />
        <input
          className={styles.input}
          type="text"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length > 0 ? optionId(safeIndex) : undefined}
          aria-label={t('inputLabel')}
          placeholder={t('placeholder')}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          data-autofocus
        />
        <kbd className={styles.kbd}>Esc</kbd>
      </div>

      <div className={styles.sectionLabel} aria-hidden="true">
        {hasQuery ? t('results') : t('recent')}
      </div>

      <ul id={listId} role="listbox" aria-label={t('resultsLabel')} className={styles.results}>
        {results.map((result, index) => (
          <li
            key={result.pageId}
            id={optionId(index)}
            role="option"
            aria-selected={index === safeIndex}
            className={styles.result}
            onMouseMove={() => setActiveIndex(index)}
            onClick={() => openResult(result)}
          >
            <span className={styles.resultIcon} aria-hidden="true">
              {result.icon}
            </span>
            <span className={styles.resultBody}>
              <span className={styles.resultTitle}>{result.title}</span>
              {result.path.length > 0 && (
                <span className={styles.resultPath}>{result.path.join(' / ')}</span>
              )}
              {result.snippet && (
                <span className={styles.snippet}>
                  {result.snippet.before}
                  <mark>{result.snippet.match}</mark>
                  {result.snippet.after}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className={styles.empty} role="status">
          {hasQuery ? t('noResults', { query: query.trim() }) : t('noPages')}
        </p>
      )}

      <footer className={styles.footer} aria-hidden="true">
        <span>
          <kbd className={styles.kbd}>↑</kbd>
          <kbd className={styles.kbd}>↓</kbd> {t('navigate')}
        </span>
        <span>
          <kbd className={styles.kbd}>↵</kbd> {t('open')}
        </span>
      </footer>
    </Modal>
  );
}
