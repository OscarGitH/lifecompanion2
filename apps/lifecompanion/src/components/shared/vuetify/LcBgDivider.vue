<script lang="ts">
const vDividerDefaultConfig: VDivider["$props"] = {
	color: "background",
	opacity: 1,
	thickness: 3,
};
</script>

<script lang="ts" setup>
import {
	makeVDividerProps,
	type VDivider,
} from "vuetify/lib/components/VDivider/VDivider.mjs";

defineProps(makeVDividerProps(vDividerDefaultConfig));
</script>

<template>
	<VDivider v-bind="$props" />
</template>
