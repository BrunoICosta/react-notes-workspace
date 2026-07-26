import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import i18n, { LANGUAGE_STORAGE_KEY } from '../../i18n';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('shows the current language and switches the whole UI', async () => {
    const user = userEvent.setup();
    render(
      <>
        <LanguageSwitcher />
        <ThemeToggle />
      </>,
    );

    const select = screen.getByRole('combobox', { name: 'Idioma' });
    expect(select).toHaveValue('pt-BR');
    expect(screen.getByRole('button', { name: /ativar tema/i })).toBeInTheDocument();

    await user.selectOptions(select, 'en');

    expect(i18n.language).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
    expect(
      screen.getByRole('button', { name: /switch to (light|dark) theme/i }),
    ).toBeInTheDocument();
  });
});
