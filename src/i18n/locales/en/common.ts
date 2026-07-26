import type { Translation } from '../../types';
import type { common as source } from '../pt-BR/common';

export const common: Translation<typeof source> = {
  appName: 'Notes Workspace',
  metaDescription:
    'A Notion-inspired notes workspace: nested pages, block editor, slash commands and quick search.',
  untitled: 'Untitled',
  cancel: 'Cancel',
  skipToContent: 'Skip to content',
  theme: {
    enableLight: 'Switch to light theme',
    enableDark: 'Switch to dark theme',
    light: 'Light theme',
    dark: 'Dark theme',
  },
  language: {
    label: 'Language',
    names: {
      'pt-BR': 'Português (Brasil)',
      en: 'English',
    },
  },
};
