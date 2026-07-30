import {
	type MaybeRefOrGetter,
	onBeforeUnmount,
	shallowRef,
	toValue,
	watch,
} from "vue";
import {
	INPUT_DEVICE_KEYBOARD_ID,
	INPUT_DEVICE_MOUSE_ID,
} from "../../../features/player/io/devices/constants";
import keyboardInputDeviceFactory from "../../../features/player/io/devices/keyboardInputDeviceFactory";
import mouseInputDeviceFactory from "../../../features/player/io/devices/mouseInputDeviceFactory";
import type {
	InputDevice,
	InputDeviceConfig,
} from "../../../features/player/io/devices/types";

const useInputDevices = (
	devicesConfigs: MaybeRefOrGetter<InputDeviceConfig[]>,
	...devicesArgs: Parameters<InputDevice>
) => {
	const makeDevice = (config: InputDeviceConfig) => {
		switch (config.type) {
			case INPUT_DEVICE_MOUSE_ID:
				return mouseInputDeviceFactory(config.options);
			case INPUT_DEVICE_KEYBOARD_ID:
				return keyboardInputDeviceFactory(config.options);
		}
	};

	const unbinds = shallowRef<(() => void)[]>([]);

	const unbindDevices = () => {
		unbinds.value.forEach((unbind) => {
			unbind();
		});
		unbinds.value = [];
	};

	const bindDevices = (configs: InputDeviceConfig[]) => {
		unbindDevices();

		unbinds.value = configs.map((config) => makeDevice(config)(...devicesArgs));
	};

	const stopWatch = watch(() => toValue(devicesConfigs), bindDevices, {
		immediate: true,
	});

	onBeforeUnmount(() => {
		unbindDevices();
		stopWatch();
	});
};

export default useInputDevices;
