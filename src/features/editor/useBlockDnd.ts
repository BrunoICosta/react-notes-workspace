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
import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '../workspace/store/workspaceStore';

/** Blocks only move vertically. */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Sensors, announcements and the drop handler for reordering the blocks of a page. */
export function useBlockDnd(pageId: string) {
  const moveBlock = useWorkspaceStore((state) => state.moveBlock);
  const { t } = useTranslation('editor');

  const screenReaderInstructions = useMemo<ScreenReaderInstructions>(
    () => ({ draggable: t('dnd.instructions') }),
    [t],
  );

  const sensors = useSensors(
    // A small distance keeps clicks on the handle from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements = useMemo<Announcements>(() => {
    const position = (id: UniqueIdentifier | undefined) => {
      const blocks = useWorkspaceStore.getState().pages[pageId]?.blocks ?? [];
      const index = blocks.findIndex((block) => block.id === id);
      return t('dnd.position', { index: index + 1, total: blocks.length });
    };
    return {
      onDragStart: ({ active }) => t('dnd.picked', { position: position(active.id) }),
      onDragOver: ({ over }) => (over ? t('dnd.over', { position: position(over.id) }) : undefined),
      onDragEnd: ({ over }) =>
        over ? t('dnd.dropped', { position: position(over.id) }) : t('dnd.droppedOutside'),
      onDragCancel: () => t('dnd.cancelled'),
    };
  }, [pageId, t]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (over && active.id !== over.id) moveBlock(pageId, String(active.id), String(over.id));
    },
    [moveBlock, pageId],
  );

  return { sensors, announcements, screenReaderInstructions, handleDragEnd };
}
