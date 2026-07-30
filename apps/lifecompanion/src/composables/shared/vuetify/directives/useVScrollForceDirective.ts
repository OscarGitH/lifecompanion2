import { ref } from "vue";

interface ForceScrollOptions {
	threshold?: number;
	delay?: number;
	onlyTrusted?: boolean;
	ignoreLayoutShift?: boolean;
	down?: (e: Event) => void;
	up?: (e: Event) => void;
	left?: (e: Event) => void;
	right?: (e: Event) => void;
}

export const useVScrollForceDirective = (options: ForceScrollOptions = {}) => {
	const {
		threshold = 30,
		delay = 120,
		onlyTrusted = true,
		ignoreLayoutShift = true,
		down,
		up,
		left,
		right,
	} = options;

	let lastScrollTop = 0;
	let lastScrollLeft = 0;

	let lastClientWidth = 0;
	let lastClientHeight = 0;

	const scrollTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

	const vScrollHandler = (e: Event) => {
		const target = e.target as Document | HTMLElement | null;
		if (!target) return;

		if (onlyTrusted && !e.isTrusted) {
			lastScrollTop =
				target instanceof HTMLElement
					? target.scrollTop
					: (window.scrollY ?? 0);

			lastScrollLeft =
				target instanceof HTMLElement
					? target.scrollLeft
					: (window.scrollX ?? 0);

			return;
		}

		const currentClientWidth =
			target instanceof HTMLElement ? target.clientWidth : window.innerWidth;
		const currentClientHeight =
			target instanceof HTMLElement ? target.clientHeight : window.innerHeight;

		if (lastClientWidth === 0 && lastClientHeight === 0) {
			lastClientWidth = currentClientWidth;
			lastClientHeight = currentClientHeight;
		}

		if (
			ignoreLayoutShift &&
			(currentClientWidth !== lastClientWidth ||
				currentClientHeight !== lastClientHeight)
		) {
			lastScrollTop =
				target instanceof HTMLElement
					? target.scrollTop
					: (window.scrollY ?? 0);

			lastScrollLeft =
				target instanceof HTMLElement
					? target.scrollLeft
					: (window.scrollX ?? 0);

			lastClientWidth = currentClientWidth;
			lastClientHeight = currentClientHeight;

			return;
		}

		lastClientWidth = currentClientWidth;
		lastClientHeight = currentClientHeight;

		const currentScrollTop =
			target instanceof HTMLElement
				? target.scrollTop
				: (window.scrollY ?? document.documentElement.scrollTop ?? 0);

		const currentScrollLeft =
			target instanceof HTMLElement
				? target.scrollLeft
				: (window.scrollX ?? document.documentElement.scrollLeft ?? 0);

		const deltaY = currentScrollTop - lastScrollTop;
		const deltaX = currentScrollLeft - lastScrollLeft;

		const absDeltaY = Math.abs(deltaY);
		const absDeltaX = Math.abs(deltaX);

		let callbackToTrigger: ((e: Event) => void) | undefined;

		if (absDeltaY > threshold && absDeltaY > absDeltaX) {
			callbackToTrigger = deltaY > 0 ? down : up;
		} else if (absDeltaX > threshold && absDeltaX > absDeltaY) {
			callbackToTrigger = deltaX > 0 ? right : left;
		}

		if (callbackToTrigger) {
			if (scrollTimeout.value) {
				clearTimeout(scrollTimeout.value);
			}

			const finalCallback = callbackToTrigger;
			scrollTimeout.value = setTimeout(() => {
				finalCallback(e);
			}, delay);
		}

		lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
		lastScrollLeft = currentScrollLeft <= 0 ? 0 : currentScrollLeft;
	};

	return {
		vScrollHandler,
	};
};
