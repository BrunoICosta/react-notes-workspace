# Notes Workspace

🇧🇷 Português · [🇺🇸 English](./README.en.md)

Workspace de notas inspirado no Notion, feito com React 19, TypeScript e Zustand. As páginas formam
uma árvore aninhada na barra lateral e cada página é um editor de blocos (texto, títulos, tarefas,
listas, citação, código, divisor e destaque), com menu de comandos por `/`, atalhos de Markdown,
reordenação por arrastar e soltar (inclusive pelo teclado) e busca rápida com `Ctrl/⌘ + K`. Tudo
fica salvo no `localStorage` do navegador, com versionamento e migração do formato salvo. A
interface está disponível em português (padrão) e inglês.

**Demo:** https://brunoicosta.github.io/react-notes-workspace/

![Página de boas-vindas no tema claro](docs/screenshot.png)

<details>
<summary>Tema escuro</summary>

![Página de tipos de bloco no tema escuro](docs/screenshot-dark.png)

</details>

## Funcionalidades

- **Árvore de páginas:** criar, renomear (inline, duplo clique ou `F2`), aninhar/desaninhar,
  recolher ramos e excluir com confirmação (avisando quantas subpáginas serão removidas).
- **Favoritos e ícones:** seção de favoritos na barra lateral e um emoji por página, escolhido em
  um seletor navegável pelo teclado.
- **Editor de blocos:** parágrafo, título 1/2/3, tarefa com checkbox, lista com marcadores, lista
  numerada (numeração automática), citação, código (fonte monoespaçada, `Tab` indenta), divisor e
  destaque.
- **Menu de comandos `/`:** filtra por nome ou palavra-chave (sem acento, pt-BR e inglês) e é
  navegável por setas, `Enter`/`Tab` e `Esc`, sem tirar o foco do bloco.
- **Teclado em primeiro lugar:** `Enter` cria um bloco (listas continuam; item vazio sai da
  lista), `Backspace` no início converte, junta ou exclui e foca o bloco anterior, `↑`/`↓` navegam
  entre blocos e o título.
- **Atalhos de Markdown:** `#`, `##`, `###`, `-`, `1.`, `[]`, `>`, ` ``` ` e `---`.
- **Arrastar e soltar:** reordenação de blocos com dnd-kit pela alça, com mouse, toque ou teclado
  (`Espaço` + setas) e anúncios para leitores de tela no idioma ativo.
- **Busca rápida (`Ctrl/⌘ + K`):** títulos e conteúdo, sem diferenciar acentos, com trecho
  destacado e o caminho da página.
- **Trilha de navegação** (breadcrumbs) que se resume em telas pequenas ou caminhos longos.
- **Tema claro/escuro** salvo e aplicado antes da primeira pintura (sem flash).
- **Persistência versionada:** migrações passo a passo e saneamento dos dados ao carregar
  (referências quebradas e páginas órfãs são reparadas em vez de quebrar a aplicação).
- **Páginas de boas-vindas** que explicam os recursos, com opção de restaurá-las.
- **Responsivo:** em telas pequenas a barra lateral vira uma gaveta (drawer) com foco gerenciado.
- **Português e inglês:** seletor de idioma com bandeiras no topo; o menu `/` encontra os blocos nos dois
  idiomas e as datas seguem o idioma ativo.

## Stack

| Tecnologia                                         | Versão            |
| -------------------------------------------------- | ----------------- |
| React / React DOM                                  | 19.2              |
| TypeScript (strict)                                | 6.0               |
| Vite + @vitejs/plugin-react                        | 8.1 / 6.0         |
| Zustand (`persist`)                                | 5.0               |
| Immer                                              | 11.1              |
| @dnd-kit/core / @dnd-kit/sortable                  | 6.3 / 10.0        |
| Vitest + Testing Library + jsdom                   | 4.1 / 16.3 / 29   |
| ESLint (typescript-eslint, react-hooks) + Prettier | 10 / 3.9          |
| i18next / react-i18next / languagedetector         | 26.3 / 17.0 / 8.2 |
| CSS Modules + variáveis CSS                        | —                 |

## Arquitetura e decisões

- **Estado normalizado:** páginas ficam em um `Record<id, Page>` e a forma da árvore em `rootIds` e
  `childIds`. Mover, aninhar e excluir viram operações em listas de ids, sem percorrer estruturas
  aninhadas.
- **Regras de negócio como funções puras:** `model/tree.ts` e `model/blocks.ts` recebem o estado e
  devolvem um novo estado (com Immer). O store do Zustand só cuida de ids, datas e de chamar essas
  funções, então quase toda a lógica é testada sem React.
- **Zustand em vez de Context/Redux:** seletores finos evitam renderizar a árvore inteira a cada
  tecla, e o middleware `persist` resolve armazenamento, versão e migração em poucas linhas.
  O estado de interface que não deve ser salvo (busca aberta, gaveta, confirmação) fica em um store
  separado.
- **Blocos como `<textarea>`:** em vez de `contenteditable`, cada bloco é uma textarea que cresce
  com o conteúdo. Assim `selectionStart`/`selectionEnd` ficam confiáveis para dividir, juntar e
  navegar, o componente continua controlado e os testes com Testing Library ficam simples.
  Pedidos de foco são aplicados depois do render para o React não jogar o cursor para o fim.
- **Migrações versionadas:** `WORKSPACE_SCHEMA_VERSION` mais um mapa `versão → migração` que roda
  passo a passo, seguido de um saneamento que garante que cada página tenha um único pai.
- **dnd-kit:** acessível por padrão (sensor de teclado e live region), leve e sem depender de
  HTML5 drag and drop, que não funciona bem em toque.
- **CSS Modules + tokens:** todos os componentes usam variáveis CSS; o tema escuro só troca os
  valores em `html[data-theme='dark']`.
- **Acessibilidade:** menus seguem o padrão WAI-ARIA (menu, listbox com `aria-activedescendant`,
  combobox na busca), diálogos prendem o foco e devolvem para quem os abriu, o resto da página fica
  `inert` com a gaveta aberta e há um link "pular para o conteúdo".

## Internacionalização

A interface usa [i18next](https://www.i18next.com/) com `react-i18next` e
`i18next-browser-languagedetector`. Idiomas suportados: **pt-BR** (padrão) e **en**.

- **Detecção:** escolha salva no `localStorage` (`notes-workspace:language`) > idioma do navegador
  (`pt*` vira `pt-BR`, qualquer outro vira `en`) > `pt-BR`. O seletor no topo da tela salva a escolha
  e o atributo `<html lang>` acompanha o idioma ativo.
- **Recursos tipados:** um arquivo TypeScript por namespace (`common`, `workspace`, `editor`,
  `search`) em `src/i18n/locales/<idioma>/`. O pt-BR é a fonte; os outros idiomas usam o tipo
  `Translation<typeof fonte>`, então faltar ou sobrar uma chave quebra o `tsc`. As chaves usadas em
  `t()` também são verificadas via `CustomTypeOptions`.
- **Formatação:** datas usam `Intl.DateTimeFormat` com o idioma ativo; plurais usam as regras do
  i18next (`_one`/`_other`).
- **Menu `/`:** os rótulos aparecem no idioma ativo, mas a busca considera rótulos e palavras-chave
  de todos os idiomas (`/heading` funciona em português e `/titulo` em inglês).
- **Páginas de exemplo:** são criadas no idioma ativo na primeira visita (ou ao restaurar os
  exemplos). Páginas que já existem não são traduzidas ao trocar de idioma, porque são conteúdo do
  usuário.

**Adicionar um idioma** (ex.: `es`):

1. Crie `src/i18n/locales/es/` com os mesmos namespaces, tipando cada um com `Translation<...>`.
2. Registre o idioma em `SUPPORTED_LANGUAGES` e em `resources` (`src/i18n/resources.ts`) e ajuste
   `normalizeLanguage` em `src/i18n/index.ts`.
3. Adicione o nome em `common.language.names` e, se quiser, páginas de exemplo em
   `src/features/workspace/seed/`.

## Como rodar

Requisitos: Node.js 22+ e npm 10+.

```bash
npm install
npm run dev          # servidor de desenvolvimento em http://localhost:5173
npm test             # testes unitários e de componentes (Vitest)
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # checagem de tipos + build de produção em dist/
npm run preview      # serve o build de produção
```

## Estrutura de pastas

```
src/
├── app/                    # componente raiz
├── i18n/                   # configuração do i18next e traduções por namespace
├── features/
│   ├── editor/             # página, editor de blocos, menu "/", atalhos, drag and drop
│   ├── layout/             # shell, topbar, breadcrumbs, estado de UI
│   ├── preferences/        # tema claro/escuro e seletor de idioma
│   ├── search/             # busca rápida e função de busca
│   ├── sidebar/            # árvore de páginas, favoritos, diálogos
│   └── workspace/
│       ├── model/          # tipos e operações puras de árvore e blocos
│       ├── seed/           # páginas de boas-vindas (pt-BR e en)
│       └── store/          # store Zustand, seletores e migrações
├── shared/
│   ├── hooks/              # atalhos globais, media query, popovers, auto-resize
│   ├── lib/                # utilitários (ids)
│   └── ui/                 # Modal, ConfirmDialog, DropdownMenu, ícones
├── styles/                 # tokens e estilos globais
└── test/                   # setup do Vitest
```

## Próximos passos

- Formatação inline (negrito, itálico, links) e colar Markdown convertendo em blocos.
- Arrastar páginas na barra lateral e blocos para outras páginas.
- Desfazer/refazer com histórico de operações.
- Exportar/importar páginas em Markdown ou JSON.
- Sincronização opcional com um backend e colaboração em tempo real.

## Autor

Bruno Vinicius Isaac Costa — https://github.com/BrunoICosta

Licença [MIT](./LICENSE).
