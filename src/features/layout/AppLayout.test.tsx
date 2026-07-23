import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { AppLayout } from './AppLayout';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('AppLayout on small screens', () => {
  beforeEach(() => {
    mockMatchMedia(true);
    let ws = createEmptyWorkspace();
    ws = addPage(ws, { id: 'a', title: 'Página A', now: 1 });
    ws = addPage(ws, { id: 'b', title: 'Página B', now: 1 });
    useWorkspaceStore.setState(setActivePage(ws, 'a'));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('opens the sidebar as a drawer and closes it after picking a page', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);

    const menuButton = screen.getByRole('button', { name: 'Abrir barra lateral' });
    const sidebar = screen.getByRole('complementary', { hidden: true });
    expect(sidebar).toHaveAttribute('inert');

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(sidebar).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Fechar barra lateral' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Página B' }));
    expect(useWorkspaceStore.getState().activePageId).toBe('b');
    expect(sidebar).toHaveAttribute('inert');
  });

  it('closes the drawer with Escape and gives focus back to the menu button', async () => {
    const user = userEvent.setup();
    render(<AppLayout />);
    const menuButton = screen.getByRole('button', { name: 'Abrir barra lateral' });

    await user.click(menuButton);
    await user.keyboard('{Escape}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
  });
});
