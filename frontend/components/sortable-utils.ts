import { CSS } from '@dnd-kit/utilities';

const DEFAULT_TRANSFORM = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
const DRAGGING_OPACITY = 0.4;

export function getSortableStyle(
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null | undefined,
  transition: string | undefined,
  isDragging: boolean,
  draggingOpacity = DRAGGING_OPACITY,
): React.CSSProperties {
  return {
    transform: CSS.Transform.toString(transform ?? DEFAULT_TRANSFORM),
    transition,
    opacity: isDragging ? draggingOpacity : 1,
  };
}
