import { common as enCommon } from './locales/en/common';
import { common as ptCommon } from './locales/pt-BR/common';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'pt-BR';

export const defaultNS = 'common';

/** pt-BR is the source language; every other language must match its shape. */
export const resources = {
  'pt-BR': { common: ptCommon },
  en: { common: enCommon },
} as const;

export const NAMESPACES = Object.keys(resources[DEFAULT_LANGUAGE]) as Array<
  keyof (typeof resources)['pt-BR']
>;
