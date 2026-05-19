import { inputEventManager } from '../../features/services/editor/interaction/InputEventManager';

export function useKeyboardInput() {
  let isStarted: boolean = false;

  const onSentEvent = (event: KeyboardEvent) => {
    inputEventManager().emit(event);
  };

  const start = () => {
    if (isStarted) stop();
    isStarted = true;

    document.addEventListener("keydown", onSentEvent, true);
    document.addEventListener("keyup", onSentEvent, true);
    document.addEventListener("keypress", onSentEvent, true);
  };

  const stop = () => {
    if (!isStarted) return;

    document.removeEventListener("keydown", onSentEvent, true);
    document.removeEventListener("keyup", onSentEvent, true);
    document.removeEventListener("keypress", onSentEvent, true);
    isStarted = false;
  };

  return { start, stop };
}