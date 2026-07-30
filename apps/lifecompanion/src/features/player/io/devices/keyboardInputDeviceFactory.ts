import optionalWindowEventListener from "../utils/optionalWindowEventListener";
import shouldListenToDeviceEvent from "../utils/shouldListenToDeviceEvent";
import {
	INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
	INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
	KEYBOARD_ENTER,
	KEYBOARD_SPACE,
} from "./constants";
import type {
	InputDevice,
	InputDeviceActivateEvent,
	InputDeviceOptions,
} from "./types";

type KeyboardInputDeviceButtons = "Enter" | "Space";

export type KeyboardInputDeviceOptions = InputDeviceOptions & {
	buttons: KeyboardInputDeviceButtons[];
	activate: InputDeviceActivateEvent;
};

const keyboardInputDeviceFactory = (
	options: KeyboardInputDeviceOptions,
): InputDevice => {
	const KEYBOARD_BUTTONS: Record<string, KeyboardInputDeviceButtons> = {
		Enter: KEYBOARD_ENTER,
		" ": KEYBOARD_SPACE,
		// TODO: add more keys if that's the best solution
	};

	return (listeners) => {
		const { press, activate, release } = listeners;

		const onKeyboardActivateListener =
			press || activate || release
				? (event: KeyboardEvent) => {
						const buttonName = KEYBOARD_BUTTONS[event.key];
						if (buttonName && options.buttons?.includes(buttonName)) {
							const isRelease = event.type === "keyup";

							if (
								isRelease &&
								options.activate === INPUT_DEVICE_ACTIVATE_EVENT_RELEASE
							) {
								activate?.({ position: undefined });
							}

							isRelease
								? release?.({ position: undefined })
								: press?.({ position: undefined });

							if (
								!isRelease &&
								options.activate === INPUT_DEVICE_ACTIVATE_EVENT_PRESS
							) {
								activate?.({ position: undefined });
							}
						}
					}
				: undefined;

		const unbindKeyDownListener = optionalWindowEventListener(
			"keydown",
			shouldListenToDeviceEvent(
				INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
				options.buttons,
				listeners,
				options.activate,
			)
				? onKeyboardActivateListener
				: undefined,
		);

		const unbindKeyUpListener = optionalWindowEventListener(
			"keyup",
			shouldListenToDeviceEvent(
				INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
				options.buttons,
				listeners,
				options.activate,
			)
				? onKeyboardActivateListener
				: undefined,
		);

		return () => {
			unbindKeyDownListener();
			unbindKeyUpListener();
		};
	};
};

export default keyboardInputDeviceFactory;
