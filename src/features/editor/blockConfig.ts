import type { BlockType } from '../workspace/model/types';

export interface BlockTypeConfig {
  type: BlockType;
  /** Name shown in menus and used as the accessible label of the block. */
  label: string;
  description: string;
  /** Short glyph shown in the slash menu preview tile. */
  glyph: string;
  placeholder: string;
  /** Extra search terms (pt-BR and English) for the slash menu. */
  keywords: string[];
}

export const BLOCK_CONFIG: Record<BlockType, BlockTypeConfig> = {
  paragraph: {
    type: 'paragraph',
    label: 'Texto',
    description: 'Comece a escrever com texto simples.',
    glyph: 'Aa',
    placeholder: "Digite '/' para ver os comandos",
    keywords: ['paragrafo', 'paragraph', 'text', 'texto'],
  },
  heading1: {
    type: 'heading1',
    label: 'Título 1',
    description: 'Título de seção grande.',
    glyph: 'H1',
    placeholder: 'Título 1',
    keywords: ['h1', 'heading', 'titulo', 'cabecalho'],
  },
  heading2: {
    type: 'heading2',
    label: 'Título 2',
    description: 'Título de seção médio.',
    glyph: 'H2',
    placeholder: 'Título 2',
    keywords: ['h2', 'heading', 'titulo', 'subtitulo'],
  },
  heading3: {
    type: 'heading3',
    label: 'Título 3',
    description: 'Título de seção pequeno.',
    glyph: 'H3',
    placeholder: 'Título 3',
    keywords: ['h3', 'heading', 'titulo'],
  },
  todo: {
    type: 'todo',
    label: 'Lista de tarefas',
    description: 'Acompanhe tarefas com caixas de seleção.',
    glyph: '☑',
    placeholder: 'Tarefa',
    keywords: ['todo', 'checkbox', 'tarefa', 'check', 'task'],
  },
  bulleted: {
    type: 'bulleted',
    label: 'Lista com marcadores',
    description: 'Crie uma lista simples com marcadores.',
    glyph: '•',
    placeholder: 'Item da lista',
    keywords: ['bullet', 'lista', 'ul', 'marcador', 'list'],
  },
  numbered: {
    type: 'numbered',
    label: 'Lista numerada',
    description: 'Crie uma lista com numeração.',
    glyph: '1.',
    placeholder: 'Item da lista',
    keywords: ['numbered', 'ol', 'numero', 'ordenada', 'list'],
  },
  quote: {
    type: 'quote',
    label: 'Citação',
    description: 'Destaque uma citação.',
    glyph: '❝',
    placeholder: 'Citação',
    keywords: ['quote', 'citacao', 'blockquote'],
  },
  code: {
    type: 'code',
    label: 'Código',
    description: 'Trecho de código em fonte monoespaçada.',
    glyph: '</>',
    placeholder: 'Escreva seu código…',
    keywords: ['code', 'codigo', 'snippet', 'monospace', 'pre'],
  },
  divider: {
    type: 'divider',
    label: 'Divisor',
    description: 'Separe visualmente as seções.',
    glyph: '—',
    placeholder: '',
    keywords: ['divider', 'hr', 'linha', 'separador', 'divisor'],
  },
  callout: {
    type: 'callout',
    label: 'Destaque',
    description: 'Chame atenção para uma informação.',
    glyph: '💡',
    placeholder: 'Escreva um destaque…',
    keywords: ['callout', 'destaque', 'aviso', 'nota', 'info'],
  },
};
