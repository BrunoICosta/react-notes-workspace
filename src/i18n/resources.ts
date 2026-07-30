import { common as enCommon } from './locales/en/common';
import { editor as enEditor } from './locales/en/editor';
import { search as enSearch } from './locales/en/search';
import { workspace as enWorkspace } from './locales/en/workspace';
import { common as ptCommon } from './locales/pt-BR/common';
import { editor as ptEditor } from './locales/pt-BR/editor';
import { search as ptSearch } from './locales/pt-BR/search';
import { workspace as ptWorkspace } from './locales/pt-BR/workspace';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'pt-BR';

export const defaultNS = 'common';

/** pt-BR is the source language; every other language must match its shape. */
export const resources = {
  'pt-BR': { common: ptCommon, workspace: ptWorkspace, editor: ptEditor, search: ptSearch },
  en: { common: enCommon, workspace: enWorkspace, editor: enEditor, search: enSearch },
} as const;

export const NAMESPACES = Object.keys(resources[DEFAULT_LANGUAGE]) as Array<
  keyof (typeof resources)['pt-BR']
>;
