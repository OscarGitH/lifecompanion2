<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const mouseX = ref(100);
const mouseY = ref(100);

const MOVEMENT_SPEED = 20;

const handleKeyboardEvent = (event: any) => {
	switch (event.button) {
		case "ArrowUp":
			mouseY.value = Math.max(0, mouseY.value - MOVEMENT_SPEED);
			break;
		case "ArrowDown":
			mouseY.value = Math.min(window.innerHeight, mouseY.value + MOVEMENT_SPEED);
			break;
		case "ArrowLeft":
			mouseX.value = Math.max(0, mouseX.value - MOVEMENT_SPEED);
			break;
		case "ArrowRight":
			mouseX.value = Math.min(window.innerWidth, mouseX.value + MOVEMENT_SPEED);
			break;
    case "Enter":

      break;
    default:
      break;
	}
};

onMounted(() => {
  // TODO
});

onUnmounted(() => {
  // TODO
});
</script>

<template>
	<div>
		<div
			class="mouse-cursor"
			:style="{
				left: `${mouseX}px`,
				top: `${mouseY}px`,
			}"
		>
			<svg
				viewBox="0 0 24 24"
				width="24"
				height="24"
			>
				<path
					d="M 2 3 L 2 21 L 8 15 L 14 24 L 18 22 L 12 13 L 20 13 Z"
				/>
			</svg>
		</div>
	</div>
</template>

<style scoped>
.mouse-cursor {
	position: fixed;
	width: 24px;
	height: 24px;
	transform: translate(-2px, -2px);
	pointer-events: none;
	z-index: 9999;
}
</style>