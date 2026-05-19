import type { LcCell, LcLayout, LcPage } from "@lifecompanion/model";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface InFocus {
	parent: LcLayout | LcPage;
	cell: LcCell;
}

export const useInFocusStore = defineStore("inFocus", () => {
	const current = ref<InFocus | undefined>(undefined);

	return { current };
});
