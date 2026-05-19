<script setup lang="ts">
import type {
	LcCell,
	LcCellContent,
	LcLayout,
	LcPage,
} from "@lifecompanion/model";
import { computed } from "vue";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { usePlayerStore } from "../../../stores/player/usePlayerStore";
import { cellCardCornerStyle } from "../../../utils/player/grid";
import CellCardContent from "./CellCardContent.vue";

const { createParentResolver } = useActivePlayer();
const playerStore = usePlayerStore();

const { parent, cell } = defineProps<{
	parent: LcLayout | LcPage;
	cell: LcCell;
}>();

const { getCellContent } = createParentResolver(() => parent);

const content = computed<LcCellContent | undefined>(() =>
	getCellContent.value(cell),
);

const action = () =>
	content.value?.action && playerStore.triggerAction(content.value.action);
</script>

<template>
	<v-card
		v-if="content"
		class="d-flex h-100"
		:style="cellCardCornerStyle(content)"
		@click="action"
	>
		<cell-card-content :content="content" />
	</v-card>
</template>
