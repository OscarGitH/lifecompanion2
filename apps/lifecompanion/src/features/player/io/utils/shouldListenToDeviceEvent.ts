import {
	INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
	INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
} from "../devices/constants";
import type {
	InputDeviceActivateEvent,
	InputDeviceListeners,
} from "../devices/types";

export default (
	eventType: InputDeviceActivateEvent,
	buttonList: readonly unknown[],
	listener: InputDeviceListeners,
	activate: InputDeviceActivateEvent,
): boolean => {
	if (buttonList.length === 0) {
		return false;
	}

	if (eventType === INPUT_DEVICE_ACTIVATE_EVENT_PRESS) {
		return (
			listener.press !== undefined ||
			(listener.activate !== undefined &&
				activate === INPUT_DEVICE_ACTIVATE_EVENT_PRESS)
		);
	}

	return (
		listener.release !== undefined ||
		(listener.activate !== undefined &&
			activate === INPUT_DEVICE_ACTIVATE_EVENT_RELEASE)
	);
};
