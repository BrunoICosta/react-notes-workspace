import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useMemo } from 'react';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';

/** Blocks only move vertically. */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Para mover o bloco, pressione Espaço. Use as setas para cima e para baixo para escolher a nova posição, Espaço para soltar ou Esc para cancelar.',
};

/** Sensors, announcements and the drop handler for reordering the blocks of a page. */
export function useBlockDnd(pageId: string) {
  const moveBlock = useWorkspaceStore((state) => state.moveBlock);

  const sensors = useSensors(
    // A small distance keeps clicks on the handle from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements = useMemo<Announcements>(() => {
    const position = (id: UniqueIdentifier | undefined) => {
      const blocks = useWorkspaceStore.getState().pages[pageId]?.blocks ?? [];
      const index = blocks.findIndex((block) => block.id === id);
      return `${index + 1} de ${blocks.length}`;
    };
    return {
      onDragStart: ({ active }) => `Bloco na posição ${position(active.id)} selecionado.`,
      onDragOver: ({ over }) => (over ? `Sobre a posição ${position(over.id)}.` : undefined),
      onDragEnd: ({ over }) =>
        over ? `Bloco movido para a posição ${position(over.id)}.` : 'Bloco solto.',
      onDragCancel: () => 'Movimento cancelado.',
    };
  }, [pageId]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over && active.id !== over.id) moveBlock(pageId, String(active.id), String(over.id));
    },
    [moveBlock, pageId],
  );

  return { sensors, announcements, handleDragEnd };
}
