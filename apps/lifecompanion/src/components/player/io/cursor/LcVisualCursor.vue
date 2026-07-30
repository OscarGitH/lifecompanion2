<script setup lang="ts">
import type { Position2D } from "../../../../utils/shared/geometry/types";

defineProps<{
	cursorPosition: Position2D;
}>();
</script>

<template>
	<div
		class="virtual-pointer"
		:style="{
			left: `${cursorPosition.x}px`,
			top: `${cursorPosition.y}px`,
		}"
	/>
</template>

<style scoped>
.virtual-pointer {
	position: fixed;
	pointer-events: none;
	transform: translate(-50%, -50%);
	z-index: 9999;

	background-color: red;
	width: 20px;
	height: 20px;
	border-radius: 50%;
}
</style>
