import { useLayoutEffect, type RefObject } from 'react';

/** Grows a textarea with its content so it behaves like a block of text. */
export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [ref, value]);
}
