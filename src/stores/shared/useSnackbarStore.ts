import { defineStore } from "pinia";
import { ref } from "vue";
import type { SnackbarQueueMessage } from "vuetify/lib/types.mjs";

export const useSnackbarStore = defineStore("snackbar", () => {
	const queue = ref<SnackbarQueueMessage[]>([]);

	return { queue };
});
