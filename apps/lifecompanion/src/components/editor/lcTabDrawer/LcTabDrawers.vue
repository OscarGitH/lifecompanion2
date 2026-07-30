<script lang="ts" setup>
import {
	mdiBellRingOutline,
	mdiGrid,
	mdiNavigationVariantOutline,
	mdiTextBoxOutline,
} from "@mdi/js";
import { ref } from "vue";
import { useDisplay } from "vuetify";
import LcTabsNavigationDrawer from "../../shared/vuetify/LcTabsNavigationDrawer.vue";
import CaseTabWindow from "./tabWindows/caseTabWindow.vue";
import LayoutTabWindow from "./tabWindows/layoutTabWindow.vue";
import NavigationTabWindow from "./tabWindows/navigationTabWindow.vue";

const { lgAndUp } = useDisplay();

const bottomTabDrawer = ref<
	InstanceType<typeof LcTabsNavigationDrawer> | undefined
>();

defineExpose({
	collapseBottomTabDrawer: () => bottomTabDrawer.value?.collapseDrawer(),
});
</script>

<template>
	<template v-if="lgAndUp">
		<LcTabsNavigationDrawer :rail="true">
			<template #tab-navigation="{isTab}">
				<VIcon v-if="isTab" :icon="mdiNavigationVariantOutline" />
				<NavigationTabWindow v-else />
			</template>
			<template #tab-other="{isTab}">
				<VIcon v-if="isTab" :icon="mdiBellRingOutline" />
				<div v-else>Not implemented</div>
			</template>
		</LcTabsNavigationDrawer>

		<LcTabsNavigationDrawer location="end">
			<template #tab-layout="{isTab}">
				<VIcon v-if="isTab" :icon="mdiGrid" />
				<LayoutTabWindow v-else />
			</template>
			<template #tab-case="{isTab}">
				<VIcon v-if="isTab" :icon="mdiTextBoxOutline" />
				<CaseTabWindow v-else />
			</template>
		</LcTabsNavigationDrawer>
	</template>

	<VBottomSheet
		v-else
		:model-value="true"
		:scrim="false"
		:touch="false"
		scroll-strategy="none"
		persistent
		no-click-animation
		@touchmove.stop
	>
		<LcTabsNavigationDrawer
			ref="bottomTabDrawer"
			location="bottom"
			touch-drag-bar
		>
			<template #tab-navigation="{isTab}">
				<VIcon v-if="isTab" :icon="mdiNavigationVariantOutline" />
				<NavigationTabWindow v-else />
			</template>
			<template #tab-other="{isTab}">
				<VIcon v-if="isTab" :icon="mdiBellRingOutline" />
				<div v-else>Not implemented</div>
			</template>
			<template #tab-layout="{isTab}">
				<VIcon v-if="isTab" :icon="mdiGrid" />
				<LayoutTabWindow v-else />
			</template>
			<template #tab-case="{isTab}">
				<VIcon v-if="isTab" :icon="mdiTextBoxOutline" />
				<CaseTabWindow v-else />
			</template>
		</LcTabsNavigationDrawer>
	</VBottomSheet>
</template>
