import { computed, type MaybeRefOrGetter, ref, toValue } from "vue";
import type {
	VisualProgressOptions,
	VisualProgressProps,
} from "../../../components/player/visualEffect/LcVisualProgress.vue";

type Progress = {
	startTime: number;
	duration: number;
	animationFrame?: number | undefined;
	resolve?: ((completed: boolean) => void) | undefined;
};

export default (options: MaybeRefOrGetter<VisualProgressOptions | null>) => {
	let progress: Progress | undefined;
	const progressValue = ref(0);

	const visualProgressProps = computed(
		(): VisualProgressProps => ({
			options: toValue(options),
			value: progressValue.value,
		}),
	);

	const stopAnimation = () => {
		if (progress && progress.animationFrame !== undefined) {
			cancelAnimationFrame(progress.animationFrame);
			progress.animationFrame = undefined;
		}
	};

	const frame = (progress: Progress, now: number) => {
		const elapsed = now - progress.startTime;
		progressValue.value = Math.min(elapsed / progress.duration, 1);

		if (progressValue.value >= 1) {
			stopAnimation();
			progress.resolve?.(true);
			progress.resolve = undefined;
			return;
		}

		progress.animationFrame = requestAnimationFrame((now) =>
			frame(progress, now),
		);
	};

	const stopProgress = () => {
		stopAnimation();

		if (progress) {
			progress.resolve?.(false);
			progress = undefined;
		}
	};

	const resetProgress = () => {
		stopProgress();
		progressValue.value = 0;
	};

	const startProgress = (duration: number) => {
		resetProgress();

		return new Promise<boolean>((resolve) => {
			progress = {
				startTime: performance.now(),
				duration,
				resolve,
			};

			progress.animationFrame = requestAnimationFrame((now) => {
				if (progress) {
					frame(progress, now);
				}
			});
		});
	};

	return {
		visualProgressProps,
		startProgress,
		stopProgress,
		resetProgress,
	};
};
