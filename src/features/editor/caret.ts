export type CaretTarget = 'start' | 'end' | number;

/** Focuses a block element and places the caret, when it is a text field. */
export function focusWithCaret(element: HTMLElement, caret: CaretTarget): void {
  element.focus({ preventScroll: false });
  if (!(element instanceof HTMLTextAreaElement)) return;
  const length = element.value.length;
  const position = caret === 'start' ? 0 : caret === 'end' ? length : Math.min(caret, length);
  element.setSelectionRange(position, position);
}

/** True when the caret is collapsed at the very beginning of the field. */
export function isCaretAtStart(element: HTMLTextAreaElement): boolean {
  return element.selectionStart === 0 && element.selectionEnd === 0;
}

/** True when the caret sits on the first line (no line break before it). */
export function isCaretOnFirstLine(element: HTMLTextAreaElement): boolean {
  return !element.value.slice(0, element.selectionStart).includes('\n');
}

/** True when the caret sits on the last line (no line break after it). */
export function isCaretOnLastLine(element: HTMLTextAreaElement): boolean {
  return !element.value.slice(element.selectionEnd).includes('\n');
}
