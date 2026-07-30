<script setup lang="ts">
import { computed, useSlots, type VNode } from "vue";
import { VBtn } from "vuetify/components";
import { makeVBtnGroupProps } from "vuetify/lib/components/VBtnGroup/VBtnGroup.mjs";
import LcBgDivider from "./LcBgDivider.vue";

const props = defineProps({
	...makeVBtnGroupProps(),
	noDivider: {
		type: Boolean,
		default: false,
	},
});

defineSlots<{ default(): VNode & { type: typeof VBtn }[] }>();

const slots = useSlots();

const vBtnGroupBindings = computed(() => {
	const { noDivider, ...rest } = props;

	return rest;
});

const buttons = computed(() => {
	const defaultSlot = slots.default ? slots.default() : [];

	const extractBtn = (nodes: VNode[]): VNode[] =>
		nodes.flatMap((node) => {
			if (node.type === VBtn) {
				return node;
			}

			const children = node.children;
			if (Array.isArray(children) && children.length) {
				return extractBtn(node.children as VNode[]);
			}

			return [];
		});

	return extractBtn(defaultSlot);
});
</script>

<template>
	<VBtnGroup class="bg-surface" v-bind="vBtnGroupBindings">
		<template v-for="(btn, i) in buttons" :key="i">
			<component :is="btn" />
			<LcBgDivider v-if="!noDivider && i < buttons.length - 1" vertical />
		</template>
	</VBtnGroup>
</template>
