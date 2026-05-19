<script setup lang="ts">
import { mdiMenu } from "@mdi/js";
import { ref } from "vue";
import type { Position } from "vuetify/lib/composables/position.mjs";
import type { Variant } from "vuetify/lib/composables/variant.mjs";
import type { Anchor } from "vuetify/lib/framework.mjs";

export type LcSpeedDialItems = [LcSpeedDialItem, ...LcSpeedDialItem[]];

export interface LcSpeedDialItem {
	id?: string;
	icon: string;
	title?: string;
	color?: string;
	action?: () => void;
}

const open = defineModel<boolean>("open", { default: false });

const {
	items = [{ icon: mdiMenu }],
	position = "fixed",
	location = "bottom right",
	size = "default",
	variant = "elevated",
	menuLocation = "top center",
	menuTransition = "slide-y-transition",
	menuPersistent = false,
	menuItemSize = "small",
	menuOffset = "8",
	tooltipsDelay,
	openOnHover = false,
} = defineProps<{
	items?: LcSpeedDialItems;
	position?: Position;
	location?: Anchor;
	size?: string | number;
	color?: string;
	variant?: Variant;
	menuLocation?: Anchor;
	menuTransition?: string;
	menuPersistent?: boolean;
	menuItemSize?: string | number;
	menuOffset?: string;
	tooltipsDelay?: string | number;
	openOnHover?: boolean;
}>();

const emit = defineEmits<(e: "click:item", item: LcSpeedDialItem) => void>();

const isHoveringSubItem = ref<boolean>(false);

const handleFabClick = (event: PointerEvent) => {
	const target = event.target as HTMLElement;

	// ignore dial items
	if (target.closest(".v-speed-dial__content")) {
		return;
	}

	event.stopPropagation();
	onClickItem(items[0]);
	open.value = !open.value;
};

function onClickItem(item: LcSpeedDialItem) {
	if (item.action) item.action();
	emit("click:item", item);
}
</script>

<template>
	<v-fab
		ref="fabRef"
		:absolute="position === 'absolute'"
		:app="position === 'fixed'"
		:location="location"
		:size="size"
		:variant="variant"
		:color="items[0].color ?? color"
		icon
		@click.capture="handleFabClick"
	>
		<v-icon :icon="items[0].icon" :size="size" />
		<v-tooltip
			v-if="items[0]?.title && !isHoveringSubItem"
			:text="items[0].title"
			:open-delay="tooltipsDelay"
			activator="parent"
			location="start"
		/>
		<v-speed-dial
			v-model="open"
			:location="menuLocation"
			:transition="menuTransition"
			:persistent="menuPersistent"
			:offset="menuOffset"
			:open-on-hover="openOnHover"
			activator="parent"
			attach
		>
			<v-btn
				v-for="(item, index) in items.slice(1)"
				:key="item.id ?? index"
				:icon="item.icon"
				:color="item.color || color"
				:title="item.title"
				:variant="variant"
				:size="menuItemSize"
				@mouseenter="isHoveringSubItem = true"
				@mouseleave="isHoveringSubItem = false"
				@click.stop="() => onClickItem(item)"
			>
				<v-icon :icon="item.icon" :size="menuItemSize" />
				<v-tooltip
					v-if="item.title"
					:text="item.title"
					:open-delay="tooltipsDelay"
					activator="parent"
					location="start"
				/>
			</v-btn>
		</v-speed-dial>
	</v-fab>
</template>

<style scoped>
/*
 * biome-ignore lint/correctness/noUnknownPseudoClass: should be resolved in 2.4 
 * see https://biomejs.dev/blog/biome-v2-4/#major-improvements-to-html-ish-languages 
 */
:deep(.v-speed-dial__content) {
	gap: v-bind('menuOffset + "px"');
}
</style>
