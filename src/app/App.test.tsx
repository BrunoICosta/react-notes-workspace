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
