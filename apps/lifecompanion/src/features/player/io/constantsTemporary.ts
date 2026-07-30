/**
 * Temporary settings.
 *
 * This file exists only until the Settings UI
 * TODO: Remove this file once settings is available.
 */
import type {
	CursorStyle,
	PointerSelectionModeOptions,
} from "../../../components/player/io/selection/LcPointerSelectionMode.vue";
import type { ScanSelectionModeOptions } from "../../../components/player/io/selection/LcScanSelectionMode.vue";
import {
	INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
	INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
	INPUT_DEVICE_KEYBOARD_ID,
	INPUT_DEVICE_MOUSE_ID,
	KEYBOARD_ENTER,
	KEYBOARD_SPACE,
	MOUSE_ACTIVATE_LEFT_BUTTON,
	MOUSE_ACTIVATE_RIGHT_BUTTON,
} from "./devices/constants";
import type { ActivateStyle, HoverStyle } from "./interactiveElement/types";
import type { SelectionModeConfig } from "./selection/types";

export const DEFAULT_POINTER_STYLES: CursorStyle = {
	width: 20,
	height: 20,
	borderRadius: 50,
	background: "#ff0000ff",
};

export const DEFAULT_HOVER_SCAN_STYLE: HoverStyle = {
	borderColor: "#0000ff",
	borderSize: 5,

	scale: 1.3,

	overlay: true,
	overlayColor: "#000000AA",

	progress: {
		type: "stick",
		color: "#ff0000",
		size: 5,
	},
};

export const DEFAULT_HOVER_POINTER_STYLE: HoverStyle = {
	borderColor: "#0000ff",
	borderSize: 5,

	scale: 1.3,

	overlay: false,
	overlayColor: "#000000AA",

	progress: {
		type: "bar",
		color: "#00FFFF5A",
		size: 5,
	},
};

export const DEFAULT_ACTIVATE_SCAN_STYLE: ActivateStyle = {
	borderColor: "#d000ff",
	borderSize: 5,
	ripple: false,
};

export const DEFAULT_ACTIVATE_POINTER_STYLE: ActivateStyle = {
	borderColor: "#ff0000ff",
	borderSize: 5,
	ripple: false,
};

export const DEFAULT_ACTIVATE_STYLE: ActivateStyle = {
	borderColor: "#ff0000ff",
	borderSize: 10,
	ripple: false,
};

export const DEFAULT_POINTER_OPTIONS: PointerSelectionModeOptions = {
	devices: [
		{
			type: INPUT_DEVICE_MOUSE_ID,
			options: {
				activate: INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
				buttons: [MOUSE_ACTIVATE_LEFT_BUTTON],
				activationHoldTime: 0,
				intervalBetweenActivations: 0,
			},
		},
		{
			type: INPUT_DEVICE_KEYBOARD_ID,
			options: {
				activate: INPUT_DEVICE_ACTIVATE_EVENT_PRESS,
				buttons: [KEYBOARD_ENTER, KEYBOARD_SPACE],
				activationHoldTime: 0,
				intervalBetweenActivations: 0,
			},
		},
	],
	hoverStyle: DEFAULT_HOVER_POINTER_STYLE,
	activateStyle: DEFAULT_ACTIVATE_POINTER_STYLE,

	autoActivation: true,
	autoActivationDelay: 1000,

	cursorStyle: DEFAULT_POINTER_STYLES,
};

export const DEFAULT_SCAN_OPTIONS: ScanSelectionModeOptions = {
	devices: [
		{
			type: INPUT_DEVICE_MOUSE_ID,
			options: {
				activate: INPUT_DEVICE_ACTIVATE_EVENT_RELEASE,
				buttons: [MOUSE_ACTIVATE_RIGHT_BUTTON],
				activationHoldTime: 0,
				intervalBetweenActivations: 0,
			},
		},
	],
	hoverStyle: DEFAULT_HOVER_SCAN_STYLE,
	activateStyle: DEFAULT_ACTIVATE_SCAN_STYLE,

	autoStart: false,
	delayByElement: 1000,
	level: "grid",
	axis: { axis: "y", reverseX: false, reverseY: false },
};

export const DEFAULT_SELECTION_MODES_CONFIG: SelectionModeConfig[] = [
	{
		type: "pointer",
		options: DEFAULT_POINTER_OPTIONS,
	},
	{
		type: "scan",
		options: DEFAULT_SCAN_OPTIONS,
	},
];
