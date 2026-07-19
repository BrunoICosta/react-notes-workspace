import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createBlock } from '../workspace/model/blocks';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import type { Block } from '../workspace/model/types';
import { selectActivePage } from '../workspace/store/selectors';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { PageView } from './PageView';

function seedPage(blocks: Block[]) {
  const ws = addPage(createEmptyWorkspace(), { id: 'p', title: 'Notas', now: 1, blocks });
  useWorkspaceStore.setState(setActivePage(ws, 'p'));
}

function ConnectedPage() {
  const page = useWorkspaceStore(selectActivePage);
  return page ? <PageView page={page} /> : null;
}

const blocks = () => useWorkspaceStore.getState().pages.p.blocks;

describe('BlockEditor keyboard behaviour', () => {
  beforeEach(() => {
    seedPage([
      createBlock('a', 'paragraph', 'Primeira linha'),
      createBlock('b', 'paragraph', 'Segunda'),
    ]);
  });

  it('splits the block at the caret on Enter and focuses the new block', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);
    const [first] = screen.getAllByRole('textbox', { name: 'Texto' });

    await user.click(first);
    (first as HTMLTextAreaElement).setSelectionRange(8, 8);
    await user.keyboard('{Enter}');

    expect(blocks().map((block) => block.text)).toEqual(['Primeira', ' linha', 'Segunda']);
    expect(screen.getAllByRole('textbox', { name: 'Texto' })[1]).toHaveFocus();
  });

  it('deletes an empty block with Backspace and focuses the previous one', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);
    const second = screen.getAllByRole('textbox', { name: 'Texto' })[1];

    await user.click(second);
    await user.clear(second);
    await user.keyboard('{Backspace}');

    expect(blocks().map((block) => block.id)).toEqual(['a']);
    const first = screen.getByRole('textbox', { name: 'Texto' }) as HTMLTextAreaElement;
    expect(first).toHaveFocus();
    expect(first.selectionStart).toBe(first.value.length);
  });

  it('merges a block into the previous one with Backspace at the start', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);
    const second = screen.getAllByRole('textbox', { name: 'Texto' })[1] as HTMLTextAreaElement;

    await user.click(second);
    second.setSelectionRange(0, 0);
    await user.keyboard('{Backspace}');

    expect(blocks().map((block) => block.text)).toEqual(['Primeira linhaSegunda']);
    const merged = screen.getByRole('textbox', { name: 'Texto' }) as HTMLTextAreaElement;
    expect(merged.selectionStart).toBe('Primeira linha'.length);
  });

  it('moves between blocks and the title with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);
    const [first, second] = screen.getAllByRole('textbox', { name: 'Texto' });

    await user.click(first);
    await user.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('textbox', { name: 'Título da página' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(first).toHaveFocus();
  });
});

describe('BlockEditor lists', () => {
  it('continues a to-do list and exits it on an empty item', async () => {
    seedPage([createBlock('t', 'todo', 'Comprar café')]);
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('textbox', { name: 'Lista de tarefas' }));
    await user.keyboard('{End}{Enter}');
    expect(blocks().map((block) => block.type)).toEqual(['todo', 'todo']);

    await user.keyboard('{Enter}');
    expect(blocks().map((block) => block.type)).toEqual(['todo', 'paragraph']);
  });

  it('toggles a to-do checkbox', async () => {
    seedPage([createBlock('t', 'todo', 'Ler documentação')]);
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('checkbox', { name: 'Marcar como concluída' }));
    expect(blocks()[0].checked).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Marcar como pendente' })).toBeChecked();
  });
});

describe('Slash command menu', () => {
  beforeEach(() => seedPage([createBlock('a', 'paragraph', '')]));

  it('filters block types and converts the block with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);
    const input = screen.getByRole('textbox', { name: 'Texto' });

    await user.click(input);
    await user.keyboard('/');
    expect(screen.getByRole('listbox', { name: 'Tipos de bloco' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(11);

    await user.keyboard('titulo');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      expect.stringContaining('Título 1'),
      expect.stringContaining('Título 2'),
      expect.stringContaining('Título 3'),
    ]);

    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1].id);

    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(blocks()[0]).toMatchObject({ type: 'heading2', text: '' });
    expect(screen.getByRole('textbox', { name: 'Título 2' })).toHaveFocus();
  });

  it('closes with Escape and keeps the typed text', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('textbox', { name: 'Texto' }));
    await user.keyboard('/cod{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(blocks()[0]).toMatchObject({ type: 'paragraph', text: '/cod' });
  });

  it('inserts a divider when chosen with the mouse', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('textbox', { name: 'Texto' }));
    await user.keyboard('/div');
    await user.click(screen.getByRole('option', { name: /divisor/i }));
    expect(blocks().map((block) => block.type)).toEqual(['divider', 'paragraph']);
  });
});

describe('Markdown shortcuts', () => {
  beforeEach(() => seedPage([createBlock('a', 'paragraph', '')]));

  it('turns "# " into a heading and "- " into a bulleted list', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('textbox', { name: 'Texto' }));
    await user.keyboard('# Plano');
    expect(blocks()[0]).toMatchObject({ type: 'heading1', text: 'Plano' });

    await user.keyboard('{Enter}- item');
    expect(blocks()[1]).toMatchObject({ type: 'bulleted', text: 'item' });
  });

  it('turns "---" into a divider followed by a new paragraph', async () => {
    const user = userEvent.setup();
    render(<ConnectedPage />);

    await user.click(screen.getByRole('textbox', { name: 'Texto' }));
    await user.keyboard('---');
    expect(blocks().map((block) => block.type)).toEqual(['divider', 'paragraph']);
    expect(screen.getByRole('textbox', { name: 'Texto' })).toHaveFocus();
  });
});
