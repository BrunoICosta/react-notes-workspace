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
