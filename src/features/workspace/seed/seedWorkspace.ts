import { addPage, createEmptyWorkspace, setActivePage, toggleFavorite } from '../model/tree';
import type { Block, BlockType, WorkspaceData } from '../model/types';

type BlockSpec = [BlockType, string?, boolean?];

interface PageSpec {
  id: string;
  icon: string;
  title: string;
  favorite?: boolean;
  blocks: BlockSpec[];
  children?: PageSpec[];
}

const KEYBOARD_PAGE: PageSpec = {
  id: 'seed-shortcuts',
  icon: '⌨️',
  title: 'Atalhos de teclado',
  blocks: [
    ['paragraph', 'Quase tudo no editor pode ser feito sem tirar as mãos do teclado.'],
    ['heading2', 'Edição'],
    [
      'bulleted',
      'Enter — cria um novo bloco. Em listas e tarefas, o próximo item continua a lista.',
    ],
    ['bulleted', 'Enter em um item de lista vazio — sai da lista e volta para texto.'],
    ['bulleted', 'Shift + Enter — quebra de linha dentro do mesmo bloco.'],
    ['bulleted', 'Backspace no início — converte o bloco em texto ou junta com o anterior.'],
    ['bulleted', 'Backspace em um bloco vazio — exclui o bloco e volta para o anterior.'],
    ['bulleted', 'Tab dentro de um bloco de código — insere indentação.'],
    ['bulleted', 'Ctrl/⌘ + Enter em um bloco de código — cria um bloco abaixo.'],
    ['heading2', 'Atalhos de Markdown'],
    ['paragraph', 'No início de um bloco de texto vazio, digite um destes atalhos:'],
    ['bulleted', '# , ## ou ### seguidos de espaço — títulos 1, 2 e 3.'],
    ['bulleted', '- ou * seguidos de espaço — lista com marcadores.'],
    ['bulleted', '1. seguido de espaço — lista numerada.'],
    ['bulleted', '[] seguido de espaço — tarefa.'],
    ['bulleted', '> seguido de espaço — citação.'],
    ['bulleted', '``` — bloco de código.'],
    ['bulleted', '--- — divisor.'],
    ['heading2', 'Navegação'],
    ['bulleted', '↑ e ↓ — movem o cursor entre os blocos e até o título da página.'],
    ['bulleted', 'Ctrl/⌘ + K — abre a busca rápida em títulos e conteúdo.'],
    ['bulleted', '/ — abre o menu de comandos; use ↑ ↓ para escolher e Enter para aplicar.'],
    ['bulleted', 'Espaço na alça ⋮⋮ e depois ↑ ↓ — reordena blocos pelo teclado.'],
    ['bulleted', 'F2 ou duplo clique em uma página da barra lateral — renomeia.'],
    ['bulleted', 'Esc — fecha menus e diálogos.'],
  ],
};

const BLOCKS_PAGE: PageSpec = {
  id: 'seed-blocks',
  icon: '🧱',
  title: 'Tipos de bloco',
  blocks: [
    [
      'paragraph',
      'Cada linha da página é um bloco. Digite / em um bloco vazio para trocar o tipo.',
    ],
    ['heading1', 'Título 1'],
    ['heading2', 'Título 2'],
    ['heading3', 'Título 3'],
    ['paragraph', 'Texto simples, o bloco padrão.'],
    ['todo', 'Uma tarefa pendente'],
    ['todo', 'Uma tarefa concluída', true],
    ['bulleted', 'Lista com marcadores'],
    ['bulleted', 'Outro item da lista'],
    ['numbered', 'Lista numerada'],
    ['numbered', 'A numeração é automática'],
    ['quote', 'Citações ficam com uma barra lateral para se destacar do texto.'],
    ['code', 'function greet(name: string) {\n  return `Olá, ${name}!`;\n}'],
    ['divider'],
    ['callout', 'Destaques chamam atenção para avisos e dicas importantes.'],
  ],
};

const ORGANIZING_PAGE: PageSpec = {
  id: 'seed-organizing',
  icon: '🗂️',
  title: 'Organizando páginas',
  blocks: [
    ['paragraph', 'Páginas podem ter subpáginas, formando uma árvore na barra lateral.'],
    ['bulleted', 'Use o + ao lado de uma página para criar uma subpágina.'],
    [
      'bulleted',
      'No menu ⋯ você pode renomear, favoritar, aninhar na página acima ou mover um nível acima.',
    ],
    ['bulleted', 'Clique na seta para recolher ou expandir um ramo da árvore.'],
    ['bulleted', 'Clique no ícone grande no topo da página para escolher outro emoji.'],
    ['bulleted', 'Favoritos aparecem no topo da barra lateral para acesso rápido.'],
    [
      'callout',
      'Excluir uma página também exclui todas as subpáginas dela, por isso sempre pedimos confirmação.',
    ],
  ],
  children: [
    {
      id: 'seed-subpage',
      icon: '📁',
      title: 'Exemplo de subpágina',
      blocks: [['paragraph', 'Esta é uma subpágina. Veja a trilha de navegação no topo da tela.']],
    },
  ],
};

const SEED_PAGES: PageSpec[] = [
  {
    id: 'seed-welcome',
    icon: '👋',
    title: 'Bem-vindo ao Notes Workspace',
    favorite: true,
    blocks: [
      [
        'callout',
        'Um workspace de notas inspirado no Notion. Tudo fica salvo no seu navegador (localStorage); nada é enviado para servidores.',
      ],
      ['heading2', 'Primeiros passos'],
      ['todo', 'Abrir o workspace pela primeira vez', true],
      ['todo', 'Clicar em qualquer bloco e começar a digitar'],
      ['todo', 'Digitar / para abrir o menu de comandos e trocar o tipo de um bloco'],
      ['todo', 'Pressionar Ctrl/⌘ + K para buscar em todas as páginas'],
      ['todo', 'Arrastar um bloco pela alça ⋮⋮ à esquerda para reordenar'],
      ['todo', 'Criar uma subpágina com o + ao lado de uma página na barra lateral'],
      ['heading2', 'Páginas de exemplo'],
      ['bulleted', '⌨️ Atalhos de teclado — tudo o que dá para fazer pelo teclado.'],
      ['bulleted', '🧱 Tipos de bloco — um exemplo de cada bloco disponível.'],
      ['bulleted', '🗂️ Organizando páginas — subpáginas, favoritos, ícones e exclusão.'],
      ['divider'],
      ['quote', 'Dica: alterne entre o tema claro e o escuro no rodapé da barra lateral.'],
    ],
    children: [KEYBOARD_PAGE, BLOCKS_PAGE, ORGANIZING_PAGE],
  },
  {
    id: 'seed-tasks',
    icon: '✅',
    title: 'Tarefas da semana',
    blocks: [
      ['heading3', 'Trabalho'],
      ['todo', 'Revisar o pull request do time', true],
      ['todo', 'Preparar a apresentação de sexta'],
      ['todo', 'Atualizar a documentação da API'],
      ['heading3', 'Pessoal'],
      ['todo', 'Marcar consulta no dentista'],
      ['todo', 'Comprar café'],
      ['heading3', 'Prioridades'],
      ['numbered', 'Terminar o que está em andamento'],
      ['numbered', 'Só então começar algo novo'],
    ],
  },
];

function toBlocks(pageId: string, specs: BlockSpec[]): Block[] {
  return specs.map(([type, text = '', checked = false], index) => ({
    id: `${pageId}-b${index + 1}`,
    type,
    text,
    checked,
  }));
}

/** Builds the welcome workspace shown on the first visit, explaining the features. */
export function createSeedWorkspace(now = Date.now()): WorkspaceData {
  let ws = createEmptyWorkspace();

  const add = (spec: PageSpec, parentId: string | null) => {
    ws = addPage(ws, {
      id: spec.id,
      parentId,
      title: spec.title,
      icon: spec.icon,
      blocks: toBlocks(spec.id, spec.blocks),
      now,
    });
    if (spec.favorite) ws = toggleFavorite(ws, spec.id);
    spec.children?.forEach((child) => add(child, spec.id));
  };

  SEED_PAGES.forEach((spec) => add(spec, null));
  return setActivePage(ws, SEED_PAGES[0].id);
}
