import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

const VIEWPORT_GUTTER = 8;
const OFFSET = 4;

export interface FloatingPosition {
  top: number;
  left: number;
}

/**
 * Computes a fixed position for a floating element below its anchor, flipping above
 * when there is no room and clamping horizontally to the viewport.
 */
export function useAnchoredPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
): FloatingPosition {
  const [position, setPosition] = useState<FloatingPosition>({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const width = floatingRef.current?.offsetWidth ?? 0;
    const height = floatingRef.current?.offsetHeight ?? 0;
    const fitsBelow = rect.bottom + height + OFFSET + VIEWPORT_GUTTER <= window.innerHeight;
    // Measuring needs the rendered element, hence a layout effect.
    setPosition({
      top: fitsBelow ? rect.bottom + OFFSET : Math.max(VIEWPORT_GUTTER, rect.top - height - OFFSET),
      left: Math.max(
        VIEWPORT_GUTTER,
        Math.min(rect.left, window.innerWidth - width - VIEWPORT_GUTTER),
      ),
    });
  }, [open, anchorRef, floatingRef]);

  return position;
}

/**
 * Calls `onDismiss` on pointer down outside the given elements, on window resize and
 * when an ancestor scrolls (a fixed popover would otherwise drift away from its anchor).
 */
export function useDismiss(
  open: boolean,
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!open) return;
    const isInside = (event: Event) =>
      event.target instanceof Node &&
      refs.some((ref) => ref.current?.contains(event.target as Node));
    const handleOutside = (event: Event) => {
      if (!isInside(event)) onDismiss();
    };
    document.addEventListener('pointerdown', handleOutside);
    window.addEventListener('scroll', handleOutside, true);
    window.addEventListener('resize', onDismiss);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('scroll', handleOutside, true);
      window.removeEventListener('resize', onDismiss);
    };
  }, [open, refs, onDismiss]);
}
