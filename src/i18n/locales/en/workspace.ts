import type { Translation } from '../../types';
import type { workspace as source } from '../pt-BR/workspace';

export const workspace: Translation<typeof source> = {
  sidebar: {
    label: 'Sidebar',
    open: 'Open sidebar',
    close: 'Close sidebar',
    search: 'Search',
    newPage: 'New page',
    favorites: 'Favorites',
    pages: 'Pages',
    empty: 'No pages here yet.',
  },
  tree: {
    expand: 'Expand {{title}}',
    collapse: 'Collapse {{title}}',
    actions: 'Actions for page {{title}}',
    addSubpageTo: 'Add subpage to {{title}}',
    pageName: 'Page name',
  },
  actions: {
    rename: 'Rename',
    addSubpage: 'Add subpage',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    indent: 'Nest under the page above',
    outdent: 'Move one level up',
    delete: 'Delete',
    deletePage: 'Delete page',
    more: 'More page actions',
    favorite: 'Favorite',
  },
  deleteDialog: {
    title: 'Delete “{{title}}”?',
    descriptionNoChildren: 'The page will be permanently deleted. This cannot be undone.',
    description_one: 'The page and its subpage will be permanently deleted. This cannot be undone.',
    description_other:
      'The page and its {{count}} subpages will be permanently deleted. This cannot be undone.',
    confirm: 'Delete',
  },
  reset: {
    button: 'Restore examples',
    title: 'Restore the example pages?',
    description: 'All current pages will be replaced by the welcome pages. This cannot be undone.',
    confirm: 'Restore',
  },
  topbar: {
    breadcrumbs: 'Breadcrumb',
    edited: 'Edited <time>{{date}}</time>',
  },
  empty: {
    noPagesTitle: 'Your workspace is empty',
    noPagesText: 'Create your first page to organize ideas, tasks and notes in blocks.',
    selectTitle: 'Select a page',
    selectText: 'Pick a page in the sidebar or create a new one to start writing.',
    create: 'Create page',
  },
};
