import type { BlockType } from '../model/types';

/** [type, text, checked] */
export type BlockSpec = [BlockType, string?, boolean?];

export interface PageSpec {
  id: string;
  icon: string;
  title: string;
  favorite?: boolean;
  blocks: BlockSpec[];
  children?: PageSpec[];
}
