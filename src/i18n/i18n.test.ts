import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n, { createI18n, LANGUAGE_STORAGE_KEY, normalizeLanguage } from '.';

describe('normalizeLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['pt', 'pt-BR'],
    ['en-US', 'en'],
    ['es-ES', 'en'],
    [undefined, 'pt-BR'],
  ])('maps %s to %s', (input, expected) => {
    expect(normalizeLanguage(input)).toBe(expected);
  });
});

describe('language detection', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubBrowserLanguage = (language: string) =>
    vi.stubGlobal('navigator', { ...navigator, language, languages: [language] });

  it('prefers the saved choice over the browser language', () => {
    stubBrowserLanguage('en-US');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt-BR');
    expect(createI18n({ attach: false }).language).toBe('pt-BR');
  });

  it('falls back to the browser language, mapping pt* to pt-BR', () => {
    stubBrowserLanguage('pt-PT');
    expect(createI18n({ attach: false }).language).toBe('pt-BR');

    localStorage.clear();
    stubBrowserLanguage('de-DE');
    expect(createI18n({ attach: false }).language).toBe('en');
  });
});

describe('app instance', () => {
  it('persists the choice and updates <html lang>', async () => {
    await i18n.changeLanguage('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(i18n.t('untitled')).toBe('Untitled');

    await i18n.changeLanguage('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(i18n.t('untitled')).toBe('Sem título');
  });
});
