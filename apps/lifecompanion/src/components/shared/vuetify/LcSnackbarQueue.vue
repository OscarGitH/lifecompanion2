<script lang="ts">
const vSnackBarQueueDefaultConfig: VSnackbarQueue["$props"] = {
	transition: "bouncy-slide-auto",
	location: "bottom start",
	totalVisible: 5,
	timeout: 3000,
	rounded: "lg",
	contained: true,
	closable: true,
};
</script>

<script lang="ts" setup>
import { mdiClose } from "@mdi/js";
import { computed } from "vue";
import {
	makeVSnackbarQueueProps,
	type VSnackbarQueue,
} from "vuetify/lib/components/VSnackbarQueue/VSnackbarQueue.mjs";
import { useSharedI18n } from "../../../i18n/shared";
import { useSnackbarStore } from "../../../stores/shared/useSnackbarStore";

const props = defineProps(makeVSnackbarQueueProps(vSnackBarQueueDefaultConfig));

const { t } = useSharedI18n();
const snackbarStore = useSnackbarStore();

const vSnackbarQueueBindings = computed(() => {
	const { modelValue, ...rest } = props;

	return rest;
});
</script>

<template>
	<VSnackbarQueue v-model="snackbarStore.queue" v-bind="vSnackbarQueueBindings">
		<template #actions="{ props }">
			<VBtn
				:title="t('shared.actions.close')"
				:icon="mdiClose"
				variant="text"
				v-bind="props"
			/>
		</template>
	</VSnackbarQueue>
</template>

<style>
/* From vuetify documentation: https://vuetifyjs.com/en/components/snackbar-queue/#transition */
.bouncy-slide-x-transition-enter-active,
.bouncy-slide-x-transition-leave-active,
.bouncy-slide-x-transition-move,
.bouncy-slide-x-reverse-transition-enter-active,
.bouncy-slide-x-reverse-transition-leave-active,
.bouncy-slide-x-reverse-transition-move {
	transition: transform, opacity;
	transition-duration: 0.5s;
	transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bouncy-slide-x-transition-enter-from,
.bouncy-slide-x-transition-leave-to {
	opacity: 0;
	transform: translateX(-30%);
}
.bouncy-slide-x-reverse-transition-enter-from,
.bouncy-slide-x-reverse-transition-leave-to {
	opacity: 0;
	transform: translateX(30%);
}
</style>
