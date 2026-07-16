import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppLayout } from '../layout/AppLayout';
import { createBlock } from '../workspace/model/blocks';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';

beforeEach(() => {
  let ws = createEmptyWorkspace();
  ws = addPage(ws, { id: 'home', title: 'Início', now: 3 });
  ws = addPage(ws, {
    id: 'meeting',
    title: 'Reunião semanal',
    now: 2,
    blocks: [createBlock('b', 'paragraph', 'Revisar o orçamento do trimestre')],
  });
  ws = addPage(ws, { id: 'ideas', title: 'Ideias', now: 1 });
  useWorkspaceStore.setState(setActivePage(ws, 'home'));
});

describe('QuickSearch', () => {
  it('opens with Ctrl+K and navigates to a content match with the keyboard', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    await user.keyboard('{Control>}k{/Control}');
    const dialog = screen.getByRole('dialog', { name: 'Buscar páginas' });
    const input = within(dialog).getByRole('combobox');
    expect(input).toHaveFocus();
    expect(within(dialog).getAllByRole('option')).toHaveLength(3);

    await user.type(input, 'orcamento');
    const [option] = within(dialog).getAllByRole('option');
    expect(option).toHaveTextContent('Reunião semanal');
    expect(option.querySelector('mark')).toHaveTextContent('orçamento');

    await user.keyboard('{Enter}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useWorkspaceStore.getState().activePageId).toBe('meeting');
  });

  it('shows an empty state and closes with Escape', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(within(screen.getByRole('dialog')).getByRole('status')).toHaveTextContent(
      'Nenhuma página encontrada para “zzz”.',
    );

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
