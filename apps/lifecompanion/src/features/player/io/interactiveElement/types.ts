import type { VisualProgressOptions } from "../../../../components/player/visualEffect/LcVisualProgress.vue";
import type { HexColor } from "../../../../utils/shared/style/types";
import type { SelectionModeContext } from "../selection/types";

export type InteractiveElement = {
	onEnter?: (context: SelectionModeContext, style: HoverStyle) => void;
	onLeave?: (context: SelectionModeContext) => void;
	onPress?: (context: SelectionModeContext, style: ActivateStyle) => void;
	onRelease?: (context: SelectionModeContext) => void;
	onActivate?: (
		context: SelectionModeContext,
		style: ActivateStyle,
	) => Promise<void>;
};

export type NodeRef = {
	id: string;
	readonly type: "grid" | "block" | "cell";
	element?: HTMLElement | undefined;
	interactive: InteractiveElement;
};

export type CellRef = NodeRef & {
	type: "cell";
	row: number;
	col: number;
};

export type BlockRef = NodeRef & {
	type: "block";
	blockRows: number;
	blockRow: number;
	blockCols: number;
	blockCol: number;
	cells: CellRef[];
};

export type GridRef = NodeRef & {
	type: "grid";
	blocks: BlockRef[];
};

/*
 * Style
 */
export type BasicInteractionStyle = {
	borderColor?: HexColor | undefined;
	borderSize: number;
};

export type HoverStyle = BasicInteractionStyle & {
	scale: number | undefined;
	overlay: boolean;
	overlayColor: HexColor;
	delayAutoActivate?: number | undefined;
	progress?: VisualProgressOptions | undefined;
};

export type ActivateStyle = BasicInteractionStyle & { ripple: boolean };
