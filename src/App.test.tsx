import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('increments the counter', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /count is 0/i }));
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument();
  });
});
