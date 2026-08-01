import { currentLanguage, type Language } from '../../../i18n';
import { addPage, createEmptyWorkspace, setActivePage, toggleFavorite } from '../model/tree';
import type { Block, WorkspaceData } from '../model/types';
import { SEED_PAGES_EN } from './seedContent.en';
import { SEED_PAGES_PT_BR } from './seedContent.pt-BR';
import type { BlockSpec, PageSpec } from './seedTypes';

const SEED_PAGES: Record<Language, PageSpec[]> = {
  'pt-BR': SEED_PAGES_PT_BR,
  en: SEED_PAGES_EN,
};

function toBlocks(pageId: string, specs: BlockSpec[]): Block[] {
  return specs.map(([type, text = '', checked = false], index) => ({
    id: `${pageId}-b${index + 1}`,
    type,
    text,
    checked,
  }));
}

/**
 * Builds the welcome workspace explaining the features, written in the given language
 * (the active one by default). It is only used on the first visit or when the user restores
 * the examples, so switching languages never touches pages that already exist.
 */
export function createSeedWorkspace(
  now = Date.now(),
  language: Language = currentLanguage(),
): WorkspaceData {
  const pages = SEED_PAGES[language];
  let ws = createEmptyWorkspace();

  const add = (spec: PageSpec, parentId: string | null) => {
    ws = addPage(ws, {
      id: spec.id,
      parentId,
      title: spec.title,
      icon: spec.icon,
      blocks: toBlocks(spec.id, spec.blocks),
      now,
    });
    if (spec.favorite) ws = toggleFavorite(ws, spec.id);
    spec.children?.forEach((child) => add(child, spec.id));
  };

  pages.forEach((spec) => add(spec, null));
  return setActivePage(ws, pages[0].id);
}
