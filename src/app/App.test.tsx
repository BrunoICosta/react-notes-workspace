import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('toggles the color theme', async () => {
    render(<App />);
    const initial = document.documentElement.dataset.theme;
    await userEvent.click(screen.getByRole('button', { name: /ativar tema/i }));
    expect(document.documentElement.dataset.theme).not.toBe(initial);
  });
});

describe('App workspace', () => {
  it('creates the first page from the empty state', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /workspace está vazio/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /criar página/i }));
    expect(screen.getByRole('button', { name: 'Sem título' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
