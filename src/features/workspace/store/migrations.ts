import {
  BLOCK_TYPES,
  type Block,
  type BlockType,
  type Page,
  type WorkspaceData,
} from '../model/types';
import { DEFAULT_PAGE_ICON } from '../model/tree';

/**
 * Current shape of the persisted workspace. Bump it whenever the stored data changes
 * and register a migration from the previous version below.
 *
 * - v1: initial release.
 * - v2: pages gained the `favorite` flag.
 */
export const WORKSPACE_SCHEMA_VERSION = 2;

type UnknownRecord = Record<string, unknown>;
type Migration = (state: UnknownRecord) => UnknownRecord;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapPages(state: UnknownRecord, update: (page: UnknownRecord) => UnknownRecord) {
  const pages = isRecord(state.pages) ? state.pages : {};
  return {
    ...state,
    pages: Object.fromEntries(
      Object.entries(pages).map(([id, page]) => [id, isRecord(page) ? update(page) : page]),
    ),
  };
}

/** `MIGRATIONS[n]` upgrades data persisted with version `n` to version `n + 1`. */
const MIGRATIONS: Record<number, Migration> = {
  1: (state) => mapPages(state, (page) => ({ favorite: false, ...page })),
};

/** Upgrades persisted data step by step, then sanitizes the result. */
export function migrateWorkspace(persisted: unknown, fromVersion: number): WorkspaceData {
  let state: UnknownRecord = isRecord(persisted) ? persisted : {};
  for (let version = fromVersion; version < WORKSPACE_SCHEMA_VERSION; version += 1) {
    const migration = MIGRATIONS[version];
    if (migration) state = migration(state);
  }
  return sanitizeWorkspace(state);
}

const VALID_BLOCK_TYPES = new Set<string>(BLOCK_TYPES);

function sanitizeBlock(raw: unknown): Block | null {
  if (!isRecord(raw) || typeof raw.id !== 'string') return null;
  const type =
    typeof raw.type === 'string' && VALID_BLOCK_TYPES.has(raw.type) ? raw.type : 'paragraph';
  return {
    id: raw.id,
    type: type as BlockType,
    text: typeof raw.text === 'string' ? raw.text : '',
    checked: raw.checked === true,
  };
}

function sanitizePage(id: string, raw: UnknownRecord): Page {
  const now = Date.now();
  const blocks = Array.isArray(raw.blocks) ? raw.blocks.map(sanitizeBlock) : [];
  return {
    id,
    title: typeof raw.title === 'string' ? raw.title : '',
    icon: typeof raw.icon === 'string' && raw.icon ? raw.icon : DEFAULT_PAGE_ICON,
    parentId: typeof raw.parentId === 'string' ? raw.parentId : null,
    childIds: Array.isArray(raw.childIds)
      ? raw.childIds.filter((child): child is string => typeof child === 'string')
      : [],
    blocks: blocks.filter((block): block is Block => block !== null),
    favorite: raw.favorite === true,
    collapsed: raw.collapsed === true,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  };
}

/**
 * Makes persisted data safe to use: fills missing fields, drops dangling references
 * and re-attaches orphan pages to the root so nothing silently disappears.
 */
export function sanitizeWorkspace(raw: unknown): WorkspaceData {
  const state = isRecord(raw) ? raw : {};
  const rawPages = isRecord(state.pages) ? state.pages : {};
  const pages: Record<string, Page> = {};
  for (const [id, page] of Object.entries(rawPages)) {
    if (isRecord(page)) pages[id] = sanitizePage(id, page);
  }

  const attached = new Set<string>();
  const claim = (ids: string[], parentId: string | null) =>
    ids.filter((id) => {
      const page = pages[id];
      if (!page || attached.has(id) || id === parentId) return false;
      attached.add(id);
      page.parentId = parentId;
      return true;
    });

  const rawRootIds = Array.isArray(state.rootIds)
    ? state.rootIds.filter((id): id is string => typeof id === 'string')
    : [];
  // Walk down from the given pages so every page is claimed by exactly one parent.
  const walk = (startIds: string[]) => {
    const queue = [...startIds];
    while (queue.length > 0) {
      const page = pages[queue.shift() as string];
      page.childIds = claim(page.childIds, page.id);
      queue.push(...page.childIds);
    }
  };

  const rootIds = claim(rawRootIds, null);
  walk(rootIds);

  // Pages unreachable from the roots (corrupted data) are promoted to root pages.
  for (const id of Object.keys(pages)) {
    if (attached.has(id)) continue;
    const orphan = claim([id], null);
    rootIds.push(...orphan);
    walk(orphan);
  }

  const activePageId =
    typeof state.activePageId === 'string' && pages[state.activePageId]
      ? state.activePageId
      : (rootIds[0] ?? null);

  return { pages, rootIds, activePageId };
}
