import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './DropdownMenu';

function renderMenu() {
  const onRename = vi.fn();
  const onDelete = vi.fn();
  render(
    <DropdownMenu
      label="Ações"
      triggerContent="⋯"
      items={[
        { id: 'rename', label: 'Renomear', onSelect: onRename },
        { id: 'disabled', label: 'Indisponível', disabled: true, onSelect: vi.fn() },
        { id: 'delete', label: 'Excluir', danger: true, onSelect: onDelete },
      ]}
    />,
  );
  return { onRename, onDelete };
}

describe('DropdownMenu', () => {
  it('moves through enabled items with the arrow keys', async () => {
    const user = userEvent.setup();
    const { onDelete } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Ações' });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Renomear' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Excluir' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Renomear' })).toHaveFocus();

    await user.keyboard('{End}{Enter}');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Ações' });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Ações' }));
    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
