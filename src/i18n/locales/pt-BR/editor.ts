/** Page editor, block types, slash menu and drag and drop strings. */
export const editor = {
  pageTitle: 'Título da página',
  addBlockAtEnd: 'Adicionar bloco no fim da página',
  startWriting: 'Clique para começar a escrever…',
  insertBelow: 'Inserir bloco abaixo',
  dragHint: 'Arraste para mover (ou Espaço e setas)',
  moveBlock: 'Mover bloco: {{type}}',
  dividerLabel: 'Divisor (Backspace para remover)',
  todo: {
    markDone: 'Marcar como concluída',
    markPending: 'Marcar como pendente',
  },
  icon: {
    change: 'Alterar ícone da página',
    changeShort: 'Alterar ícone',
    choose: 'Escolher ícone',
    heading: 'Ícone',
    random: 'Aleatório',
    use: 'Usar {{emoji}}',
  },
  slash: {
    label: 'Tipos de bloco',
    section: 'Blocos básicos',
    empty: 'Nenhum bloco encontrado',
  },
  dnd: {
    instructions:
      'Para mover o bloco, pressione Espaço. Use as setas para cima e para baixo para escolher a nova posição, Espaço para soltar ou Esc para cancelar.',
    position: '{{index}} de {{total}}',
    picked: 'Bloco na posição {{position}} selecionado.',
    over: 'Sobre a posição {{position}}.',
    dropped: 'Bloco movido para a posição {{position}}.',
    droppedOutside: 'Bloco solto.',
    cancelled: 'Movimento cancelado.',
  },
  /** `keywords` are extra space-separated search terms for the slash menu. */
  blocks: {
    paragraph: {
      label: 'Texto',
      description: 'Comece a escrever com texto simples.',
      placeholder: "Digite '/' para ver os comandos",
      keywords: 'paragrafo texto simples',
    },
    heading1: {
      label: 'Título 1',
      description: 'Título de seção grande.',
      placeholder: 'Título 1',
      keywords: 'h1 titulo cabecalho',
    },
    heading2: {
      label: 'Título 2',
      description: 'Título de seção médio.',
      placeholder: 'Título 2',
      keywords: 'h2 titulo subtitulo',
    },
    heading3: {
      label: 'Título 3',
      description: 'Título de seção pequeno.',
      placeholder: 'Título 3',
      keywords: 'h3 titulo',
    },
    todo: {
      label: 'Lista de tarefas',
      description: 'Acompanhe tarefas com caixas de seleção.',
      placeholder: 'Tarefa',
      keywords: 'tarefa checkbox caixa',
    },
    bulleted: {
      label: 'Lista com marcadores',
      description: 'Crie uma lista simples com marcadores.',
      placeholder: 'Item da lista',
      keywords: 'marcador lista ul',
    },
    numbered: {
      label: 'Lista numerada',
      description: 'Crie uma lista com numeração.',
      placeholder: 'Item da lista',
      keywords: 'numero ordenada ol',
    },
    quote: {
      label: 'Citação',
      description: 'Destaque uma citação.',
      placeholder: 'Citação',
      keywords: 'citacao blockquote',
    },
    code: {
      label: 'Código',
      description: 'Trecho de código em fonte monoespaçada.',
      placeholder: 'Escreva seu código…',
      keywords: 'codigo snippet monoespacado pre',
    },
    divider: {
      label: 'Divisor',
      description: 'Separe visualmente as seções.',
      placeholder: '',
      keywords: 'linha separador hr',
    },
    callout: {
      label: 'Destaque',
      description: 'Chame atenção para uma informação.',
      placeholder: 'Escreva um destaque…',
      keywords: 'aviso nota info dica',
    },
  },
} as const;
