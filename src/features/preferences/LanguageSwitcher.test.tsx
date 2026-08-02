import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import i18n, { LANGUAGE_STORAGE_KEY } from '../../i18n';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

function renderSwitcher() {
  render(
    <>
      <LanguageSwitcher />
      <ThemeToggle />
    </>,
  );
}

describe('LanguageSwitcher', () => {
  it('shows the current language as a checked flag and switches the whole UI', async () => {
    const user = userEvent.setup();
    renderSwitcher();

    expect(screen.getByRole('radiogroup', { name: 'Idioma' })).toBeInTheDocument();
    const portuguese = screen.getByRole('radio', { name: 'Português (Brasil)' });
    const english = screen.getByRole('radio', { name: 'English' });
    expect(portuguese).toHaveAttribute('aria-checked', 'true');
    expect(portuguese).toHaveAttribute('lang', 'pt-BR');
    expect(english).toHaveAttribute('aria-checked', 'false');
    expect(english).toHaveAttribute('title', 'English');
    expect(screen.getByRole('button', { name: /ativar tema/i })).toBeInTheDocument();

    await user.click(english);

    expect(i18n.language).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(screen.getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('button', { name: /switch to (light|dark) theme/i }),
    ).toBeInTheDocument();
  });

  it('is a single tab stop and changes language with the arrow keys', async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.tab();
    const portuguese = screen.getByRole('radio', { name: 'Português (Brasil)' });
    expect(portuguese).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    const english = screen.getByRole('radio', { name: 'English' });
    expect(english).toHaveFocus();
    expect(english).toHaveAttribute('aria-checked', 'true');
    expect(i18n.language).toBe('en');

    await user.tab();
    expect(screen.getByRole('button', { name: /switch to/i })).toHaveFocus();

    await user.tab({ shift: true });
    await user.keyboard('{ArrowLeft}');
    expect(i18n.language).toBe('pt-BR');
  });
});
