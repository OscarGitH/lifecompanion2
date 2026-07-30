import type { ScanAxis } from "../../../components/player/io/selection/LcScanSelectionMode.vue";
import type {
	BlockRef,
	CellRef,
	GridRef,
} from "../../player/io/interactiveElement/types";

export const sortElementByAxis = <T extends CellRef[] | BlockRef[] | GridRef[]>(
	elementRef: T,
	scanAxis: ScanAxis,
) => {
	return [...elementRef].sort((a, b) => {
		if (!a.element || !b.element) {
			return 0;
		}

		const aRect = a.element.getBoundingClientRect();
		const bRect = b.element.getBoundingClientRect();

		const compareX = () => {
			const result = aRect.left - bRect.left;
			return scanAxis.reverseX ? -result : result;
		};

		const compareY = () => {
			const result = aRect.top - bRect.top;
			return scanAxis.reverseY ? -result : result;
		};

		if (scanAxis.axis === "x") {
			return compareY() || compareX();
		}

		return compareX() || compareY();
	});
};
