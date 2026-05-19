import { inputEventManager } from '../../features/services/editor/interaction/InputEventManager';

export function useMouseInput() {
  let target: HTMLElement | null = null;

  const onSentEvent = (event: Event | PointerEvent) => {
    inputEventManager().emit(event);
  };

  const start = (newTarget: HTMLElement) => {
    if (target) stop();

    target = newTarget;

    target.addEventListener("pointerdown", onSentEvent, true);
    target.addEventListener("pointerup", onSentEvent, true);
    target.addEventListener("click", onSentEvent, true);
    target.addEventListener("contextmenu", onSentEvent, true);
  };

  const stop = () => {
    if (!target) return;

    target.removeEventListener("pointerdown", onSentEvent, true);
    target.removeEventListener("pointerup", onSentEvent, true);
    target.removeEventListener("click", onSentEvent, true);
    target.removeEventListener("contextmenu", onSentEvent, true);
    target = null;
  };

  return { start, stop };
}