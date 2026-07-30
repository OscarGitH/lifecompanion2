import optionalWindowEventListener from "../utils/optionalWindowEventListener";
import shouldListenToDeviceEvent from "../utils/shouldListenToDeviceEvent";
import {
	INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
	INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
	MOUSE_ACTIVATE_LEFT_BUTTON,
	MOUSE_ACTIVATE_MIDDLE_BUTTON,
	MOUSE_ACTIVATE_RIGHT_BUTTON,
} from "./constants";
import type {
	InputDevice,
	InputDeviceActivateEvent,
	InputDeviceOptions,
} from "./types";

type MouseInputDeviceButtons = "left" | "middle" | "right";

export type MouseInputDeviceOptions = InputDeviceOptions & {
	buttons: MouseInputDeviceButtons[];
	activate: InputDeviceActivateEvent;
};

const mouseInputDeviceFactory = (
	options: MouseInputDeviceOptions,
): InputDevice => {
	const MOUSE_BUTTONS: Record<number, MouseInputDeviceButtons> = {
		0: MOUSE_ACTIVATE_LEFT_BUTTON,
		1: MOUSE_ACTIVATE_MIDDLE_BUTTON,
		2: MOUSE_ACTIVATE_RIGHT_BUTTON,
	};

	return (listeners) => {
		const { move, press, activate, release } = listeners;
		const onMouseActivateListener =
			press || activate || release
				? (event: MouseEvent) => {
						const buttonName = MOUSE_BUTTONS[event.button];

						if (buttonName && options.buttons?.includes(buttonName)) {
							const position = {
								position: { x: event.clientX, y: event.clientY },
							};

							const isRelease = event.type === "mouseup";

							if (
								isRelease &&
								options.activate === INPUT_DEVICE_ACTIVATE_EVENT_RELEASE
							) {
								activate?.(position);
							}

							isRelease ? release?.(position) : press?.(position);

							if (
								!isRelease &&
								options.activate === INPUT_DEVICE_ACTIVATE_EVENT_PRESS
							) {
								activate?.(position);
							}
						}
					}
				: undefined;

		const unbindMouseDownListener = optionalWindowEventListener(
			"mousedown",
			shouldListenToDeviceEvent(
				INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
				options.buttons,
				listeners,
				options.activate,
			)
				? onMouseActivateListener
				: undefined,
		);

		const unbindMouseUpListener = optionalWindowEventListener(
			"mouseup",
			shouldListenToDeviceEvent(
				INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
				options.buttons,
				listeners,
				options.activate,
			)
				? onMouseActivateListener
				: undefined,
		);

		const unbindContextMenuListener = optionalWindowEventListener(
			"contextmenu",
			(event: MouseEvent) => {
				event.preventDefault();
				event.stopImmediatePropagation();
			},
		);

		const unbindMouseMoveListener = optionalWindowEventListener(
			"mousemove",
			move
				? (event) => {
						move({ position: { x: event.clientX, y: event.clientY } });
					}
				: undefined,
		);

		return () => {
			unbindMouseDownListener();
			unbindMouseUpListener();
			unbindMouseMoveListener();
			unbindContextMenuListener();
		};
	};
};

export default mouseInputDeviceFactory;
