import type { ComputedRef } from "vue";
import type { PointerSelectionModeOptions } from "../../../../components/player/io/selection/LcPointerSelectionMode.vue";
import type { ScanSelectionModeOptions } from "../../../../components/player/io/selection/LcScanSelectionMode.vue";
import type { VisualProgressProps } from "../../../../components/player/visualEffect/LcVisualProgress.vue";
import type { InputDeviceConfig } from "../devices/types";
import type { ActivateStyle, HoverStyle } from "../interactiveElement/types";

export type SelectionModeOptions = {
	devices: InputDeviceConfig[];
	hoverStyle: HoverStyle;
	activateStyle: ActivateStyle;
};

export type SelectionModeProps<Options extends object> = {
	options: Options;
};

export type SelectionModeContext = {
	id: string;
	hoverStyleOverwrite?: (hoverStyle: HoverStyle) => HoverStyle;
	activateStyleOverwrite?: (activateStyle: ActivateStyle) => ActivateStyle;
	visualProgressProps?: ComputedRef<VisualProgressProps>;
};

export type SelectionModeConfig =
	| {
			type: "pointer";
			options: PointerSelectionModeOptions;
	  }
	| {
			type: "scan";
			options: ScanSelectionModeOptions;
	  };
