import { describe, expect, it } from 'vitest';
import { createBlock } from '../workspace/model/blocks';
import { addPage, createEmptyWorkspace } from '../workspace/model/tree';
import { foldText, searchPages } from './searchPages';

function buildWorkspace() {
  let ws = createEmptyWorkspace();
  ws = addPage(ws, { id: 'travel', title: 'Viagens', now: 10 });
  ws = addPage(ws, {
    id: 'lisbon',
    parentId: 'travel',
    title: 'Roteiro em Lisboa',
    now: 30,
    blocks: [
      createBlock('b1', 'paragraph', 'Comer pastéis de Belém no fim da tarde, perto do rio Tejo.'),
    ],
  });
  ws = addPage(ws, {
    id: 'recipes',
    title: 'Receitas',
    now: 20,
    blocks: [createBlock('b2', 'todo', 'Testar receita de pastel de nata')],
  });
  return ws;
}

describe('foldText', () => {
  it('keeps the same length as the input', () => {
    const text = 'Pastéis de Belém: ÁÇÃO';
    expect(foldText(text)).toHaveLength(text.length);
    expect(foldText(text)).toBe('pasteis de belem: acao');
  });
});

describe('searchPages', () => {
  it('lists recently edited pages for an empty query', () => {
    expect(searchPages(buildWorkspace(), '  ').map((result) => result.pageId)).toEqual([
      'lisbon',
      'recipes',
      'travel',
    ]);
  });

  it('matches titles ignoring accents and case, with the ancestor path', () => {
    const [result] = searchPages(buildWorkspace(), 'LISBOA');
    expect(result).toMatchObject({
      pageId: 'lisbon',
      matchedIn: 'title',
      path: ['Viagens'],
    });
  });

  it('matches block content and returns a highlighted snippet', () => {
    const results = searchPages(buildWorkspace(), 'pasteis');
    expect(results).toHaveLength(1);
    expect(results[0].matchedIn).toBe('content');
    expect(results[0].snippet).toEqual({
      before: 'Comer ',
      match: 'pastéis',
      after: ' de Belém no fim da tarde, perto…',
    });
  });

  it('ranks title matches before content matches', () => {
    const ws = addPage(buildWorkspace(), { id: 'pastel', title: 'Pastel de feira', now: 1 });
    expect(searchPages(ws, 'pastel').map((result) => result.pageId)).toEqual(['pastel', 'recipes']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(searchPages(buildWorkspace(), 'kubernetes')).toEqual([]);
  });
});
