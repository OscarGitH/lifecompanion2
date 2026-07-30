import { computed } from "vue";

interface TouchWrapper {
	touchstartX: number;
	touchstartY: number;
	touchmoveX: number;
	touchmoveY: number;
	touchendX: number;
	touchendY: number;
	offsetX: number;
	offsetY: number;
}

interface TouchWrapperWithEvent extends TouchWrapper {
	originalEvent: TouchEvent;
}

interface SwipeGuardOptions {
	up?: (e: TouchEvent) => void;
	down?: (e: TouchEvent) => void;
	left?: (e: TouchEvent) => void;
	right?: (e: TouchEvent) => void;
}

export const useVTouchSwipeScrollGuardDirective = (
	options: SwipeGuardOptions,
) => {
	let activeNativeEvent: TouchEvent | null = null;

	let initialScrollState = {
		isAtTop: false,
		isAtBottom: false,
		isAtLeft: false,
		isAtRight: false,
	};

	const findScrollableParent = (
		startEl: Element,
		axis: "vertical" | "horizontal",
	): HTMLElement | null => {
		let el: Element | null = startEl;
		const isVertical = axis === "vertical";

		while (el && el !== document.body) {
			if (el instanceof HTMLElement) {
				const { overflowX, overflowY } = window.getComputedStyle(el);
				const isScrollable = isVertical
					? el.scrollHeight > el.clientHeight &&
						["auto", "scroll"].includes(overflowY)
					: el.scrollWidth > el.clientWidth &&
						["auto", "scroll"].includes(overflowX);

				if (isScrollable) return el;
			}
			el = el.parentElement;
		}
		return null;
	};

	const handleStart = (wrapperEvent: TouchWrapperWithEvent) => {
		activeNativeEvent = wrapperEvent?.originalEvent || null;
		if (!activeNativeEvent || !(activeNativeEvent.target instanceof Element))
			return;

		const vEl = findScrollableParent(activeNativeEvent.target, "vertical");
		const hEl = findScrollableParent(activeNativeEvent.target, "horizontal");

		initialScrollState = {
			isAtTop: vEl ? vEl.scrollTop === 0 : true,
			isAtBottom: vEl
				? vEl.scrollHeight - vEl.scrollTop <= vEl.clientHeight + 1
				: true,
			isAtLeft: hEl ? hEl.scrollLeft === 0 : true,
			isAtRight: hEl
				? hEl.scrollWidth - hEl.scrollLeft <= hEl.clientWidth + 1
				: true,
		};
	};

	const checkSwipeCondition = (
		direction: "up" | "down" | "left" | "right",
	): boolean => {
		if (direction === "down") return initialScrollState.isAtTop;
		if (direction === "up") return initialScrollState.isAtBottom;
		if (direction === "right") return initialScrollState.isAtLeft;
		if (direction === "left") return initialScrollState.isAtRight;
		return true;
	};

	const vTouchHandler = computed(() => ({
		start: (wrapperEvent: TouchWrapperWithEvent) => handleStart(wrapperEvent),
		up: () =>
			options.up &&
			checkSwipeCondition("up") &&
			activeNativeEvent &&
			options.up(activeNativeEvent),
		down: () =>
			options.down &&
			checkSwipeCondition("down") &&
			activeNativeEvent &&
			options.down(activeNativeEvent),
		left: () =>
			options.left &&
			checkSwipeCondition("left") &&
			activeNativeEvent &&
			options.left(activeNativeEvent),
		right: () =>
			options.right &&
			checkSwipeCondition("right") &&
			activeNativeEvent &&
			options.right(activeNativeEvent),
	}));

	return { vTouchHandler };
};
