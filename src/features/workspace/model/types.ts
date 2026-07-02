export const BLOCK_TYPES = [
  'paragraph',
  'heading1',
  'heading2',
  'heading3',
  'todo',
  'bulleted',
  'numbered',
  'quote',
  'code',
  'divider',
  'callout',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  /** Only meaningful for `todo` blocks. */
  checked: boolean;
}

export interface Page {
  id: string;
  title: string;
  /** A single emoji shown in the sidebar, breadcrumbs and page header. */
  icon: string;
  parentId: string | null;
  /** Ordered ids of the direct children. */
  childIds: string[];
  blocks: Block[];
  /** Whether the children are hidden in the sidebar tree. */
  collapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Normalized workspace state: pages live in a flat record and the tree
 * shape is described by `rootIds` plus each page's `childIds`.
 */
export interface WorkspaceData {
  pages: Record<string, Page>;
  rootIds: string[];
  activePageId: string | null;
}
