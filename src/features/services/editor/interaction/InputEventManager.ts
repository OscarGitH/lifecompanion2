import { SelectionMode } from '@lifecompanion/model/src/types/selectionMode';
import { useInteractionStore } from '../../../../stores/editor/useInteractionStore';

type InputEvent = PointerEvent | MouseEvent | Event | KeyboardEvent;

export type InputEventSubscriber = (event: InputEvent) => void;
const subscribers: Set<InputEventSubscriber> = new Set();

export function inputEventManager() {
  const cancelEvent = (event: InputEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  const subscribe = (subscriber: InputEventSubscriber): (() => void) => {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  const unsubscribe = (subscriber: InputEventSubscriber) => {
    subscribers.delete(subscriber);
  }

  const notifySubscribers = (event: InputEvent) => {
    subscribers.forEach(subscriber => {
      subscriber(event);
    });
  }

  const emit = (event: InputEvent) => {
    const mode = useInteractionStore().currentSelectionMode;
    let accepted = false;

    switch (mode) {
      case SelectionMode.MOUSE_CLIC:
        if (event.type === "click") {
          console.log("[INPUT]", event.type);
          accepted = true;
        } else {
          cancelEvent(event);
        }
        break;
      case SelectionMode.AUTO_MOUSE_CLIC:
        if (event.type === "simulated_click") {
          console.log("[INPUT]", event.type);
          accepted = true;
        } else {
          cancelEvent(event);
        }
        break;
    case SelectionMode.VIRTUAL_MOUSE:
      if (event.type === "keydown" || event.type === "simulated_click") {
        console.log("[INPUT]", event.type);
        accepted = true;
      } else {
        console.log("[INPUT] Ignored event type:", event.type);
        cancelEvent(event);
      }
      break;
    case SelectionMode.SCAN_KEY:
      if (event.type === "keydown" || event.type === "simulated_click") {
        console.log("[INPUT]", event.type);
        accepted = true;
      } else {
        cancelEvent(event);
      }
      break;
    case SelectionMode.COMBO:
      if (event.type === "keydown" || event.type === "click" || event.type === "simulated_click") {
        console.log("[INPUT]", event.type);
        accepted = true;
      } else {
        cancelEvent(event);
      }
      break;
    }
    if (accepted) {
      notifySubscribers(event);
    }
  }

  return {
    emit,
    subscribe,
    unsubscribe
  };
}
