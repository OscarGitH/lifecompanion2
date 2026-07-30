<script setup lang="ts">
import type { HexColor } from "../../../utils/shared/style/types";

const props = defineProps<{ overlayColor: HexColor }>();
</script>

<template>
	<div
		class="position-absolute w-100 h-100 overlayBackgroundHover"
		:style="{backgroundColor: props.overlayColor}"
	/>
</template>

<style scoped>
.overlayBackgroundHover {
	pointer-events: none;
	z-index: 2;
}
</style>
