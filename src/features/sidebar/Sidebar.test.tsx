import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppLayout } from '../layout/AppLayout';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';

function seed() {
  let ws = createEmptyWorkspace();
  ws = addPage(ws, { id: 'projects', title: 'Projetos', now: 1 });
  ws = addPage(ws, { id: 'site', parentId: 'projects', title: 'Site novo', now: 1 });
  ws = addPage(ws, { id: 'ideas', title: 'Ideias', now: 1 });
  useWorkspaceStore.setState(setActivePage(ws, 'site'));
}

describe('Sidebar page tree', () => {
  beforeEach(seed);

  it('renders nested pages and collapses a branch', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    expect(screen.getByRole('button', { name: 'Site novo' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(screen.getByRole('button', { name: 'Recolher Projetos' }));
    expect(screen.queryByRole('button', { name: 'Site novo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir Projetos' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renames a page inline', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    await user.click(screen.getByRole('button', { name: 'Ações da página Ideias' }));
    await user.click(screen.getByRole('menuitem', { name: 'Renomear' }));
    const input = screen.getByRole('textbox', { name: 'Nome da página' });
    await user.clear(input);
    await user.type(input, 'Ideias soltas{Enter}');

    expect(useWorkspaceStore.getState().pages.ideas.title).toBe('Ideias soltas');
    expect(screen.getByRole('button', { name: 'Ideias soltas' })).toBeInTheDocument();
  });

  it('asks for confirmation before deleting a page with subpages', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    await user.click(screen.getByRole('button', { name: 'Ações da página Projetos' }));
    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

    const dialog = screen.getByRole('dialog', { name: 'Excluir “Projetos”?' });
    expect(dialog).toHaveTextContent('sua subpágina');

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(useWorkspaceStore.getState().pages.projects).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Ações da página Projetos' }));
    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    const state = useWorkspaceStore.getState();
    expect(state.pages.projects).toBeUndefined();
    expect(state.pages.site).toBeUndefined();
    expect(state.activePageId).toBe('ideas');
  });

  it('nests a page under the previous sibling', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    await user.click(screen.getByRole('button', { name: 'Ações da página Ideias' }));
    await user.click(screen.getByRole('menuitem', { name: 'Aninhar na página acima' }));

    expect(useWorkspaceStore.getState().pages.projects.childIds).toEqual(['site', 'ideas']);
  });
});
