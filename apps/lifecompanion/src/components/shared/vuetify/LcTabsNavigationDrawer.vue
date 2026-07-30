<script lang="ts">
const vNavigationDrawerDefaultConfig: VNavigationDrawer["$props"] = {
	location: "start",
	width: 400,
	railWidth: 64,
	disableResizeWatcher: true,
	disableRouteWatcher: true,
	permanent: true,
};
</script>

<script lang="ts" setup>
import { mdiMenu } from "@mdi/js";
import { isNumber } from "es-toolkit";
import { computed, ref, useSlots, type VNode, watch } from "vue";
import { useDisplay } from "vuetify";
import {
	makeVNavigationDrawerProps,
	type VNavigationDrawer,
} from "vuetify/lib/components/VNavigationDrawer/VNavigationDrawer.mjs";
import { useVTouchSwipeScrollGuardDirective } from "../../../composables/shared/vuetify/directives/useVTouchSwipeScrollGuardDirective.js";
import LcBgDivider from "./LcBgDivider.vue";

const props = defineProps({
	...makeVNavigationDrawerProps(vNavigationDrawerDefaultConfig),
	menuBtn: {
		type: Boolean,
		default: false,
	},
	touchDragBar: {
		type: Boolean,
		default: false,
	},
});

defineSlots<{
	[key: `tab-${string}`]: (props: { isTab: boolean }) => VNode[];
}>();

const slots = useSlots();
const { platform } = useDisplay();

const tabModel = ref<string>();
const lastTab = ref<string>();
const isDrawerCollapsed = ref(!!props.rail);

const vNavigationDrawerBindings = computed(() => {
	const { menuBtn, rail, railWidth, ...rest } = props;

	return rest;
});

const tabSlotNames = computed(() =>
	Object.keys(slots).filter((key) => key.startsWith("tab-")),
);

const currentTabIndex = computed(() =>
	tabSlotNames.value.indexOf(tabModel.value ?? ""),
);

const railWidth = computed(() =>
	props.touchDragBar && platform.value?.touch && isNumber(props.railWidth)
		? props.railWidth + 16
		: props.railWidth,
);

const isHorizontal = computed(() => ["bottom", "top"].includes(props.location));

const isVertical = computed(() =>
	["left", "right", "start", "end"].includes(props.location),
);

const isReversed = computed(() =>
	["right", "end", "bottom"].includes(props.location),
);

const layoutClasses = computed(() => {
	if (isHorizontal.value) {
		return isReversed.value
			? "d-flex flex-column-reverse h-100"
			: "d-flex flex-column h-100";
	} else {
		return isReversed.value
			? "d-flex flex-row-reverse h-100"
			: "d-flex flex-row h-100";
	}
});

const radiusClass = computed(() => {
	switch (props.location) {
		case "left":
		case "start":
			return "rounded-s-0";
		case "right":
		case "end":
			return "rounded-e-0";
		case "top":
			return "rounded-t-0";
		case "bottom":
			return "rounded-b-0";
		default:
			return "";
	}
});

const tabWindowTransition = computed(() => {
	return isHorizontal.value
		? "slide-fade-x-reverse-transition"
		: "slide-fade-y-reverse-transition";
});

const tabWindowReverseTransition = computed(() => {
	return isHorizontal.value
		? "slide-fade-x-transition"
		: "slide-fade-y-transition";
});

const { vTouchHandler: vTouchSwipeTab } = useVTouchSwipeScrollGuardDirective({
	left: () => isHorizontal.value && nextTab(),
	right: () => isHorizontal.value && previousTab(),
	up: () => isVertical.value && nextTab(),
	down: () => isVertical.value && previousTab(),
});

const { vTouchHandler: vTouchCollapseDrawer } =
	useVTouchSwipeScrollGuardDirective({
		left: () => {
			if (["left", "start"].includes(props.location)) collapseDrawer();
			if (["right", "end"].includes(props.location)) expandDrawer();
		},
		right: () => {
			if (["left", "start"].includes(props.location)) expandDrawer();
			if (["right", "end"].includes(props.location)) collapseDrawer();
		},
		up: () => {
			if (props.location === "top") collapseDrawer();
			if (props.location === "bottom") expandDrawer();
		},
		down: () => {
			if (props.location === "top") expandDrawer();
			if (props.location === "bottom") collapseDrawer();
		},
	});

const dragBarClasses = computed(() => {
	return {
		"d-flex align-center justify-center": true,
		"w-100": isHorizontal.value,
		"h-100": isVertical.value,
		"pb-4": props.location === "top",
		"pt-4": props.location === "bottom",
		"pr-4": ["left", "start"].includes(props.location),
		"pl-4 pr-2": ["right", "end"].includes(props.location),
	};
});

const dragBarStyles = computed(() => {
	return {
		width: isHorizontal.value ? "40px" : "4px",
		height: isHorizontal.value ? "4px" : "40px",
	};
});

const expandDrawer = (toTab?: string) => {
	tabModel.value = toTab ?? lastTab.value ?? undefined;
	isDrawerCollapsed.value = false;
};

const collapseDrawer = () => {
	lastTab.value = tabModel.value;
	tabModel.value = undefined;
	isDrawerCollapsed.value = true;
};

const toggleExpandCollapseDrawer = () => {
	if (isDrawerCollapsed.value) {
		expandDrawer();
	} else {
		collapseDrawer();
	}
};

const onTabClick = (tab: string) => {
	if (isDrawerCollapsed.value) {
		expandDrawer(tab);
		return;
	}

	if (lastTab.value === tab) {
		collapseDrawer();
		return;
	}
};

const nextTab = () => {
	const total = tabSlotNames.value.length;
	const nextIndex = (currentTabIndex.value + 1) % total;
	tabModel.value = tabSlotNames.value[nextIndex];
};

const previousTab = () => {
	const total = tabSlotNames.value.length;
	const prevIndex = (currentTabIndex.value - 1 + total) % total;
	tabModel.value = tabSlotNames.value[prevIndex];
};

watch(tabModel, (value) => {
	if (value !== undefined && value !== null) {
		lastTab.value = value;
	}
});

defineExpose({ collapseDrawer });
</script>

<template>
	<VNavigationDrawer
		class="text-body-medium"
		:class="radiusClass"
		:rail="isDrawerCollapsed"
		:rail-width="railWidth"
		v-bind="vNavigationDrawerBindings"
	>
		<div :class="layoutClasses" v-touch="vTouchCollapseDrawer">
			<VTabs
				v-model="tabModel"
				:direction="isHorizontal ? 'horizontal' : 'vertical'"
				:grow="isHorizontal"
				class="pa-2"
				height="auto"
			>
				<VBtn v-if="menuBtn" icon @click="toggleExpandCollapseDrawer">
					<VIcon :icon="mdiMenu" />
				</VBtn>
				<VTab
					v-for="slotName in tabSlotNames"
					:key="`tab-${slotName}`"
					:value="slotName"
					:variant="tabModel === slotName ? 'tonal' : 'text'"
					class="ma-1 py-2"
					color="secondary"
					min-width="0"
					size="small"
					hide-slider
					@click="onTabClick(slotName)"
				>
					<slot :name="slotName as `tab-${string}`" :is-tab="true" />
				</VTab>
			</VTabs>

			<VFadeTransition hide-on-leave group>
				<template v-if="!isDrawerCollapsed">
					<lc-bg-divider :vertical="isVertical" />

					<VTabsWindow
						v-model="tabModel"
						:direction="isHorizontal ? 'horizontal' : 'vertical'"
						class="w-100 h-100"
					>
						<VTabsWindowItem
							v-for="slotName in tabSlotNames"
							:key="`tab-window-${slotName}`"
							:value="slotName"
							:transition="tabWindowTransition"
							:reverse-transition="tabWindowReverseTransition"
							class="h-100"
							v-touch="vTouchSwipeTab"
						>
							<component :is="() => slots[slotName]?.({ isTab: false })" />
						</VTabsWindowItem>
					</VTabsWindow>
				</template>
			</VFadeTransition>

			<div v-if="touchDragBar && platform?.touch" :class="dragBarClasses">
				<div class="bg-grey-lighten-1 rounded-pill" :style="dragBarStyles" />
			</div>
		</div>
	</VNavigationDrawer>
</template>
