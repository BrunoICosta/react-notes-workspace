/** Sidebar, top bar and page management strings. */
export const workspace = {
  sidebar: {
    label: 'Barra lateral',
    open: 'Abrir barra lateral',
    close: 'Fechar barra lateral',
    search: 'Buscar',
    newPage: 'Nova página',
    favorites: 'Favoritos',
    pages: 'Páginas',
    empty: 'Nenhuma página por aqui ainda.',
  },
  tree: {
    expand: 'Expandir {{title}}',
    collapse: 'Recolher {{title}}',
    actions: 'Ações da página {{title}}',
    addSubpageTo: 'Adicionar subpágina em {{title}}',
    pageName: 'Nome da página',
  },
  actions: {
    rename: 'Renomear',
    addSubpage: 'Adicionar subpágina',
    addFavorite: 'Adicionar aos favoritos',
    removeFavorite: 'Remover dos favoritos',
    indent: 'Aninhar na página acima',
    outdent: 'Mover um nível acima',
    delete: 'Excluir',
    deletePage: 'Excluir página',
    more: 'Mais ações da página',
    favorite: 'Favorito',
  },
  deleteDialog: {
    title: 'Excluir “{{title}}”?',
    descriptionNoChildren:
      'A página será excluída permanentemente. Essa ação não pode ser desfeita.',
    description_one:
      'A página e sua subpágina serão excluídas permanentemente. Essa ação não pode ser desfeita.',
    description_other:
      'A página e suas {{count}} subpáginas serão excluídas permanentemente. Essa ação não pode ser desfeita.',
    confirm: 'Excluir',
  },
  reset: {
    button: 'Restaurar exemplos',
    title: 'Restaurar as páginas de exemplo?',
    description:
      'Todas as páginas atuais serão substituídas pelas páginas de boas-vindas. Essa ação não pode ser desfeita.',
    confirm: 'Restaurar',
  },
  topbar: {
    breadcrumbs: 'Trilha de navegação',
    edited: 'Editado em <time>{{date}}</time>',
  },
  empty: {
    noPagesTitle: 'Seu workspace está vazio',
    noPagesText: 'Crie sua primeira página para organizar ideias, tarefas e anotações em blocos.',
    selectTitle: 'Selecione uma página',
    selectText: 'Escolha uma página na barra lateral ou crie uma nova para começar a escrever.',
    create: 'Criar página',
  },
} as const;
