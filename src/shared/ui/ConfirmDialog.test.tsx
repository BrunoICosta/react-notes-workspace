import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function renderDialog() {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <>
      <button type="button">Fora</button>
      <ConfirmDialog
        open
        title="Excluir página?"
        description={<p>Não dá para desfazer.</p>}
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('is an accessible modal that focuses the safe action first', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog', { name: 'Excluir página?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Não dá para desfazer.');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('traps focus inside the dialog', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveFocus();
  });

  it('cancels with Escape and confirms with the danger button', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
