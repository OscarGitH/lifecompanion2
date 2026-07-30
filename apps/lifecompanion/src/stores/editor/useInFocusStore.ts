import type {
	LcCellSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useInFocusStore = defineStore("inFocus", () => {
	const parent = ref<SchemaRecord<LcLayoutSchema | LcPageSchema>>();
	const cells = ref<SchemaRecord<LcCellSchema>[]>([]);
	const multiple = ref(false);

	const firstCell = computed(() => cells.value[0]);
	const isMultiple = computed(() => multiple.value);

	const toggleMultiple = (force?: boolean) => {
		multiple.value = force !== undefined ? force : !isMultiple.value;
	};

	const set = (
		newCell: SchemaRecord<LcCellSchema>,
		newParent?: SchemaRecord<LcLayoutSchema | LcPageSchema>,
	) => {
		if (parent && parent.value !== newParent) {
			parent.value = newParent;
			cells.value = [];
			multiple.value = false;
		}

		if (!cells.value.map((c) => c.id).includes(newCell.id)) {
			if (isMultiple.value) {
				cells.value.push(newCell);
			} else {
				cells.value = [newCell];
			}
		}
	};

	const unset = (cell: SchemaRecord<LcCellSchema>) => {
		const index = cells.value.findIndex((c) => c.id === cell.id);

		if (index !== -1) {
			cells.value.splice(index, 1);
		}
	};

	const reset = (keepParent = false) => {
		if (!keepParent) {
			parent.value = undefined;
		}

		cells.value = [];
		multiple.value = false;
	};

	return {
		parent,
		cells,
		firstCell,
		isMultiple,
		toggleMultiple,
		set,
		unset,
		reset,
	};
});
