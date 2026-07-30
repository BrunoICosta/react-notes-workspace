import type { Translation } from '../../types';
import type { search as source } from '../pt-BR/search';

export const search: Translation<typeof source> = {
  title: 'Search pages',
  inputLabel: 'Search titles or content',
  placeholder: 'Search titles or content…',
  results: 'Results',
  resultsLabel: 'Search results',
  recent: 'Recently edited',
  noResults: 'No pages found for “{{query}}”.',
  noPages: 'No pages yet.',
  navigate: 'navigate',
  open: 'open',
};
