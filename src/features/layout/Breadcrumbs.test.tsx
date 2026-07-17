import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { addPage, createEmptyWorkspace, setActivePage } from '../workspace/model/tree';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';
import { Breadcrumbs } from './Breadcrumbs';

function seedChain(depth: number) {
  let ws = createEmptyWorkspace();
  let parentId: string | null = null;
  for (let level = 0; level < depth; level += 1) {
    const id = `p${level}`;
    ws = addPage(ws, { id, parentId, title: `Nível ${level}`, now: 1 });
    parentId = id;
  }
  useWorkspaceStore.setState(setActivePage(ws, parentId));
  return useWorkspaceStore.getState().pages[parentId as string];
}

describe('Breadcrumbs', () => {
  it('shows the ancestors and navigates when one is clicked', async () => {
    const page = seedChain(3);
    render(<Breadcrumbs page={page} />);

    expect(screen.getByText('Nível 2').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await userEvent.click(screen.getByRole('button', { name: /nível 0/i }));
    expect(useWorkspaceStore.getState().activePageId).toBe('p0');
  });

  it('collapses long trails keeping the root and the closest ancestors', () => {
    const page = seedChain(6);
    render(<Breadcrumbs page={page} />);

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      expect.stringContaining('Nível 0'),
      expect.stringContaining('Nível 3'),
      expect.stringContaining('Nível 4'),
    ]);
    expect(screen.getByText('…')).toBeInTheDocument();
  });
});
