<script lang="ts" setup>
import {
	mdiArrowULeftTop,
	mdiArrowURightTop,
	mdiChevronDown,
	mdiCompare,
	mdiHomeOutline,
	mdiPlayOutline,
} from "@mdi/js";
import { useTheme } from "vuetify";
import lifecompanionLogo from "../../../public/lifecompanion-logo-1.png";
import { useEditorI18n } from "../../i18n/editor";
import { useEditorStore } from "../../stores/editor/useEditorStore";
import { usePlayerStore } from "../../stores/player/usePlayerStore";
import { useSnackbarStore } from "../../stores/shared/useSnackbarStore";
import { THEME_LIGHT } from "../../themes/light";
import { THEME_LIGHT_BORDERED } from "../../themes/lightBordered";
import LcBtnGroup from "../shared/vuetify/LcBtnGroup.vue";

const { t } = useEditorI18n();
const playerStore = usePlayerStore();
const snackbarStore = useSnackbarStore();
const editorStore = useEditorStore();

const theme = useTheme();

const toggleTheme = () => {
	theme.change(
		theme.global.name.value === THEME_LIGHT
			? THEME_LIGHT_BORDERED
			: THEME_LIGHT,
	);
};
</script>

<template>
	<VAppBar class="px-2" color="transparent" flat>
		<VBtn icon @click="playerStore.reset">
			<VImg :src="lifecompanionLogo" height="46" width="46" />
		</VBtn>
		<LcBtnGroup class="mx-2">
			<VBtn :icon="mdiHomeOutline" @click="playerStore.reset" />
			<VBtn
				text="CurrentApp"
				:append-icon="mdiChevronDown"
				@click="snackbarStore.snackUnimplemented"
			/>
		</LcBtnGroup>
		<VSpacer />
		<VBtn class="mx-1" variant="flat" icon @click="toggleTheme">
			<VIcon :icon="mdiCompare" />
		</VBtn>
		<LcBtnGroup class="mx-1" no-divider>
			<VBtn
				:icon="mdiArrowULeftTop"
				@click="snackbarStore.snackUnimplemented"
			/>
			<VBtn
				:icon="mdiArrowURightTop"
				@click="snackbarStore.snackUnimplemented"
			/>
		</LcBtnGroup>
		<VBtn
			:prepend-icon="mdiPlayOutline"
			class="ms-1"
			size="large"
			color="primary"
			variant="flat"
			@click="()=>editorStore.toggleEdition()"
		>
			{{ t('editor.appBar.previewBtn') }}
		</VBtn>
	</VAppBar>
</template>
