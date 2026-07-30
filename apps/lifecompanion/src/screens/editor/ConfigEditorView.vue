<script lang="ts" setup>
import { mdiMinus, mdiPlus } from "@mdi/js";
import { computed, provide, ref, watch } from "vue";
import AppBar from "../../components/editor/AppBar.vue";
import EditableCell from "../../components/editor/grid/EditableCell.vue";
import LockedGridLayer from "../../components/editor/grid/LockedGridLayer.vue";
// biome-ignore lint/style/useImportType: used also in template
import LcTabDrawers from "../../components/editor/lcTabDrawer/LcTabDrawers.vue";
import LcGrid from "../../components/player/grid/LcGrid.vue";
import LcGridCell from "../../components/player/grid/LcGridCell.vue";
import LcSelectionModes from "../../components/player/io/selection/LcSelectionModes.vue";
import LcVisualOverlay from "../../components/player/visualEffect/LcVisualOverlay.vue";
import LcBtnGroup from "../../components/shared/vuetify/LcBtnGroup.vue";
import { IS_HOVERING_CONTEXT_KEY } from "../../composables/player/grid/contexts/isHoveringContextKey";
import { provideGridContext } from "../../composables/player/grid/grid";
import { useVScrollForceDirective } from "../../composables/shared/vuetify/directives/useVScrollForceDirective.js";
import { DEFAULT_SELECTION_MODES_CONFIG } from "../../features/player/io/constantsTemporary";
import { useEditorStore } from "../../stores/editor/useEditorStore.js";
import { usePlayerStore } from "../../stores/player/usePlayerStore.js";
import { useSnackbarStore } from "../../stores/shared/useSnackbarStore.js";
import type { HexColor } from "../../utils/shared/style/types.js";

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

const TMP_APP_SELECTION_MODES = DEFAULT_SELECTION_MODES_CONFIG;

const playerStore = usePlayerStore();
const editorStore = useEditorStore();
const snackbarStore = useSnackbarStore();

provideGridContext();

const hovered = ref(new Map<string, HexColor>());
const isPlaying = ref<boolean | null>(false);

const overlayColor = ref<HexColor | null>(null);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const tabDrawers = ref<InstanceType<typeof LcTabDrawers> | undefined>();
const zoomLevel = ref(1);

const { vScrollHandler: vScrollContentHandler } = useVScrollForceDirective({
	down: () => tabDrawers.value?.collapseBottomTabDrawer(),
});

const gridLayers = computed(() =>
	editorStore.enabled ? [LockedGridLayer] : [],
);

const zoomIn = () => {
	if (zoomLevel.value < MAX_ZOOM) {
		zoomLevel.value = Math.min(MAX_ZOOM, zoomLevel.value + ZOOM_STEP);
	}
};

const zoomOut = () => {
	if (zoomLevel.value > MIN_ZOOM) {
		zoomLevel.value = Math.max(MIN_ZOOM, zoomLevel.value - ZOOM_STEP);
	}
};

const handleWheelZoom = (event: WheelEvent) => {
	if (event.ctrlKey || event.metaKey) {
		event.preventDefault();
		if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
			if (event.deltaY < 0) {
				zoomIn();
			} else if (event.deltaY > 0) {
				zoomOut();
			}
		}
	}
};

provide(IS_HOVERING_CONTEXT_KEY, {
	hovered,
});

watch(
	() => ({
		config: playerStore.config,
		editorEnabled: editorStore.enabled,
	}),
	({ config, editorEnabled }) => {
		isPlaying.value = config && !editorEnabled;
	},
	{ immediate: true },
);

watch(
	hovered,
	(values) => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}

		let last: HexColor | null = null;

		for (const value of values.values()) {
			last = value;
		}

		if (last === null) {
			hoverTimeout = setTimeout(() => {
				overlayColor.value = null;
			}, 50);
		} else {
			overlayColor.value = last;
		}
	},
	{ deep: true },
);
</script>

<template>
	<AppBar />
	<v-main class="d-flex flex-column">
		<v-layout class="my-4">
			<lc-tab-drawers ref="tabDrawers" />
			<v-main class="d-flex flex-column">
				<LcSelectionModes v-if="isPlaying" :modes="TMP_APP_SELECTION_MODES" />
				<LcVisualOverlay
					v-if="isPlaying && overlayColor"
					:overlayColor="overlayColor"
				/>
				<div
					class="flex-grow-1 d-flex overflow-auto px-4"
					:style="{height: 0}"
					@wheel="handleWheelZoom"
					v-scroll.self="vScrollContentHandler"
				>
					<div
						class="ma-auto"
						:style="{
              maxWidth: `${100 * zoomLevel}%`,
              minWidth: `${100 * zoomLevel}%`,
              transition: 'width 0.2s ease, min-width 0.2s ease'
            }"
					>
						<LcGrid
							v-if="playerStore.activeContext"
							:styles="{ aspectRatio: '16 / 9'}"
							:layout-stack="playerStore.activeContext.layoutStack"
							:cell-component-resolver="() => editorStore.enabled ? EditableCell : LcGridCell"
							:grid-layer-components="gridLayers"
						/>
					</div>
				</div>
				<div class="d-flex align-center mt-4 mx-4">
					<LcBtnGroup>
						<v-btn :icon="mdiMinus" @click="zoomOut" />
						<v-btn
							class="text-body-small"
							:text="`${Math.round(zoomLevel * 100)}%`"
							@click="() => zoomLevel = 1"
						/>
						<v-btn :icon="mdiPlus" @click="zoomIn" />
					</LcBtnGroup>

					<v-spacer />

					<v-btn
						:prepend-icon="mdiPlus"
						color="secondary"
						variant="flat"
						text="Nouvel élément"
						@click="snackbarStore.snackUnimplemented"
					/>
				</div>
			</v-main>
		</v-layout>
	</v-main>
</template>
