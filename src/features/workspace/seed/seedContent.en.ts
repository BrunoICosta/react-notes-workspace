import type { PageSpec } from './seedTypes';

const KEYBOARD_PAGE: PageSpec = {
  id: 'seed-shortcuts',
  icon: '⌨️',
  title: 'Keyboard shortcuts',
  blocks: [
    ['paragraph', 'Almost everything in the editor can be done without leaving the keyboard.'],
    ['heading2', 'Editing'],
    [
      'bulleted',
      'Enter — creates a new block. In lists and to-dos, the next item continues the list.',
    ],
    ['bulleted', 'Enter on an empty list item — leaves the list and turns it back into text.'],
    ['bulleted', 'Shift + Enter — line break inside the same block.'],
    [
      'bulleted',
      'Backspace at the start — turns the block into text or merges it with the previous one.',
    ],
    ['bulleted', 'Backspace on an empty block — deletes it and moves to the previous block.'],
    ['bulleted', 'Tab inside a code block — inserts indentation.'],
    ['bulleted', 'Ctrl/⌘ + Enter in a code block — creates a block below.'],
    ['heading2', 'Markdown shortcuts'],
    ['paragraph', 'At the start of an empty text block, type one of these shortcuts:'],
    ['bulleted', '# , ## or ### followed by a space — headings 1, 2 and 3.'],
    ['bulleted', '- or * followed by a space — bulleted list.'],
    ['bulleted', '1. followed by a space — numbered list.'],
    ['bulleted', '[] followed by a space — to-do.'],
    ['bulleted', '> followed by a space — quote.'],
    ['bulleted', '``` — code block.'],
    ['bulleted', '--- — divider.'],
    ['heading2', 'Navigation'],
    ['bulleted', '↑ and ↓ — move the caret between blocks and up to the page title.'],
    ['bulleted', 'Ctrl/⌘ + K — opens quick search over titles and content.'],
    ['bulleted', '/ — opens the command menu; use ↑ ↓ to choose and Enter to apply.'],
    ['bulleted', 'Space on the ⋮⋮ handle, then ↑ ↓ — reorders blocks with the keyboard.'],
    ['bulleted', 'F2 or double click on a page in the sidebar — renames it.'],
    ['bulleted', 'Esc — closes menus and dialogs.'],
  ],
};

const BLOCKS_PAGE: PageSpec = {
  id: 'seed-blocks',
  icon: '🧱',
  title: 'Block types',
  blocks: [
    ['paragraph', 'Every line on a page is a block. Type / in an empty block to change its type.'],
    ['heading1', 'Heading 1'],
    ['heading2', 'Heading 2'],
    ['heading3', 'Heading 3'],
    ['paragraph', 'Plain text, the default block.'],
    ['todo', 'A pending task'],
    ['todo', 'A completed task', true],
    ['bulleted', 'Bulleted list'],
    ['bulleted', 'Another list item'],
    ['numbered', 'Numbered list'],
    ['numbered', 'Numbering is automatic'],
    ['quote', 'Quotes get a side bar so they stand out from the text.'],
    ['code', 'function greet(name: string) {\n  return `Hello, ${name}!`;\n}'],
    ['divider'],
    ['callout', 'Callouts draw attention to important notes and tips.'],
  ],
};

const ORGANIZING_PAGE: PageSpec = {
  id: 'seed-organizing',
  icon: '🗂️',
  title: 'Organizing pages',
  blocks: [
    ['paragraph', 'Pages can have subpages, forming a tree in the sidebar.'],
    ['bulleted', 'Use the + next to a page to create a subpage.'],
    [
      'bulleted',
      'The ⋯ menu lets you rename, favorite, nest under the page above or move one level up.',
    ],
    ['bulleted', 'Click the arrow to collapse or expand a branch of the tree.'],
    ['bulleted', 'Click the big icon at the top of the page to pick another emoji.'],
    ['bulleted', 'Favorites show up at the top of the sidebar for quick access.'],
    [
      'callout',
      'Deleting a page also deletes all of its subpages, which is why we always ask for confirmation.',
    ],
  ],
  children: [
    {
      id: 'seed-subpage',
      icon: '📁',
      title: 'Example subpage',
      blocks: [['paragraph', 'This is a subpage. Check the breadcrumb at the top of the screen.']],
    },
  ],
};

export const SEED_PAGES_EN: PageSpec[] = [
  {
    id: 'seed-welcome',
    icon: '👋',
    title: 'Welcome to Notes Workspace',
    favorite: true,
    blocks: [
      [
        'callout',
        'A Notion-inspired notes workspace. Everything is saved in your browser (localStorage); nothing is sent to a server.',
      ],
      ['heading2', 'Getting started'],
      ['todo', 'Open the workspace for the first time', true],
      ['todo', 'Click any block and start typing'],
      ['todo', 'Type / to open the command menu and change a block type'],
      ['todo', 'Press Ctrl/⌘ + K to search across all pages'],
      ['todo', 'Drag a block by the ⋮⋮ handle on the left to reorder it'],
      ['todo', 'Create a subpage with the + next to a page in the sidebar'],
      ['heading2', 'Example pages'],
      ['bulleted', '⌨️ Keyboard shortcuts — everything you can do from the keyboard.'],
      ['bulleted', '🧱 Block types — one example of every available block.'],
      ['bulleted', '🗂️ Organizing pages — subpages, favorites, icons and deletion.'],
      ['divider'],
      [
        'quote',
        'Tip: switch between light and dark themes in the sidebar footer, and the language (PT/EN) in the top right corner.',
      ],
    ],
    children: [KEYBOARD_PAGE, BLOCKS_PAGE, ORGANIZING_PAGE],
  },
  {
    id: 'seed-tasks',
    icon: '✅',
    title: 'Tasks this week',
    blocks: [
      ['heading3', 'Work'],
      ['todo', "Review the team's pull request", true],
      ['todo', "Prepare Friday's presentation"],
      ['todo', 'Update the API documentation'],
      ['heading3', 'Personal'],
      ['todo', 'Book a dentist appointment'],
      ['todo', 'Buy coffee'],
      ['heading3', 'Priorities'],
      ['numbered', 'Finish what is already in progress'],
      ['numbered', 'Only then start something new'],
    ],
  },
];
