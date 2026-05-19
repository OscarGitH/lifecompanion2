import { defineStore } from "pinia";
import { ref } from "vue";

export const TABS = ["page", "content", "style", "actions"] as const;

export type BottomBarTabs = (typeof TABS)[number];

export const useBottomBarStore = defineStore("bottomBar", () => {
	const tab = ref<BottomBarTabs>();
	const height = ref<number>(0);

	return { tab, height };
});
