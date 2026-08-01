import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import i18n, { type Language } from '../../i18n';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { AppLayout } from './AppLayout';

const EXPECTED: Record<
  Language,
  { newPage: string; pages: string; untitled: string; actions: string; delete: string }
> = {
  'pt-BR': {
    newPage: 'Nova página',
    pages: 'Páginas',
    untitled: 'Sem título',
    actions: 'Ações da página Sem título',
    delete: 'Excluir',
  },
  en: {
    newPage: 'New page',
    pages: 'Pages',
    untitled: 'Untitled',
    actions: 'Actions for page Untitled',
    delete: 'Delete',
  },
};

describe.each(Object.keys(EXPECTED) as Language[])('AppLayout in %s', (language) => {
  it('renders the sidebar, the editor and menus in the active language', async () => {
    await i18n.changeLanguage(language);
    const ws = addPage(createEmptyWorkspace(), { id: 'p', now: Date.UTC(2026, 6, 20, 15) });
    useWorkspaceStore.setState(setActivePage(ws, 'p'));
    const user = userEvent.setup();
    const strings = EXPECTED[language];

    render(<AppLayout />);

    expect(document.documentElement.lang).toBe(language);
    expect(screen.getByRole('button', { name: strings.newPage })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: strings.pages })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.untitled })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await user.click(screen.getByRole('button', { name: strings.actions }));
    expect(screen.getByRole('menuitem', { name: strings.delete })).toBeInTheDocument();
  });
});
