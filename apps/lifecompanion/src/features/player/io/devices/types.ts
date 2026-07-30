import type { Position2D } from "../../../../utils/shared/geometry/types";
import type { KeyboardInputDeviceOptions } from "./keyboardInputDeviceFactory";
import type { MouseInputDeviceOptions } from "./mouseInputDeviceFactory";

export type InputDeviceActivateEvent = "press" | "release";

export type InputDeviceListeners = {
	// TODO Position is optional event property (not just "| undefined").
	activate?: (event: { position: Position2D | undefined }) => void;
	move?: (event: { position: Position2D | undefined }) => void;
	press?: (event: { position: Position2D | undefined }) => void;
	release?: (event: { position: Position2D | undefined }) => void;
};

export type InputDevice = (listeners: InputDeviceListeners) => () => void;

export type InputDeviceOptions = {
	activationHoldTime?: number;
	intervalBetweenActivations?: number;
};

export type InputDeviceConfig =
	| {
			type: "mouse";
			options: MouseInputDeviceOptions;
	  }
	| {
			type: "keyboard";
			options: KeyboardInputDeviceOptions;
	  };
