import type { Translation } from '../../types';
import type { editor as source } from '../pt-BR/editor';

export const editor: Translation<typeof source> = {
  pageTitle: 'Page title',
  addBlockAtEnd: 'Add a block at the end of the page',
  startWriting: 'Click to start writing…',
  insertBelow: 'Insert block below',
  dragHint: 'Drag to move (or Space and arrow keys)',
  moveBlock: 'Move block: {{type}}',
  dividerLabel: 'Divider (Backspace to remove)',
  todo: {
    markDone: 'Mark as done',
    markPending: 'Mark as pending',
  },
  icon: {
    change: 'Change page icon',
    changeShort: 'Change icon',
    choose: 'Choose an icon',
    heading: 'Icon',
    random: 'Random',
    use: 'Use {{emoji}}',
  },
  slash: {
    label: 'Block types',
    section: 'Basic blocks',
    empty: 'No blocks found',
  },
  dnd: {
    instructions:
      'To move a block, press Space. Use the up and down arrow keys to choose the new position, Space to drop or Escape to cancel.',
    position: '{{index}} of {{total}}',
    picked: 'Picked up block at position {{position}}.',
    over: 'Over position {{position}}.',
    dropped: 'Block moved to position {{position}}.',
    droppedOutside: 'Block dropped.',
    cancelled: 'Move cancelled.',
  },
  blocks: {
    paragraph: {
      label: 'Text',
      description: 'Just start writing with plain text.',
      placeholder: "Type '/' for commands",
      keywords: 'paragraph text plain',
    },
    heading1: {
      label: 'Heading 1',
      description: 'Big section heading.',
      placeholder: 'Heading 1',
      keywords: 'h1 heading title',
    },
    heading2: {
      label: 'Heading 2',
      description: 'Medium section heading.',
      placeholder: 'Heading 2',
      keywords: 'h2 heading subtitle',
    },
    heading3: {
      label: 'Heading 3',
      description: 'Small section heading.',
      placeholder: 'Heading 3',
      keywords: 'h3 heading',
    },
    todo: {
      label: 'To-do list',
      description: 'Track tasks with checkboxes.',
      placeholder: 'To-do',
      keywords: 'todo task checkbox check',
    },
    bulleted: {
      label: 'Bulleted list',
      description: 'Create a simple bulleted list.',
      placeholder: 'List item',
      keywords: 'bullet list ul',
    },
    numbered: {
      label: 'Numbered list',
      description: 'Create a list with numbering.',
      placeholder: 'List item',
      keywords: 'numbered ordered ol list',
    },
    quote: {
      label: 'Quote',
      description: 'Capture a quote.',
      placeholder: 'Quote',
      keywords: 'quote blockquote citation',
    },
    code: {
      label: 'Code',
      description: 'Code snippet in a monospace font.',
      placeholder: 'Write your code…',
      keywords: 'code snippet monospace pre',
    },
    divider: {
      label: 'Divider',
      description: 'Visually separate sections.',
      placeholder: '',
      keywords: 'divider line separator hr',
    },
    callout: {
      label: 'Callout',
      description: 'Make a piece of information stand out.',
      placeholder: 'Write a callout…',
      keywords: 'callout note info tip warning',
    },
  },
};
