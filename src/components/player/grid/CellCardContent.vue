<script setup lang="ts">
import type { LcCellContent } from "@lifecompanion/model";
import { isEmpty } from "es-toolkit/compat";
import { computed } from "vue";
import { usePlayerI18n } from "../../../i18n/player";

const { locale } = usePlayerI18n();

const { content } = defineProps<{ content?: LcCellContent | undefined }>();

const image = computed<string | undefined>(
	() =>
		content?.picto?.image ||
		(content?.imageBase64 && `data:image/png;base64,${content.imageBase64}`) ||
		undefined,
);
</script>

<template>
	<v-card-text
		v-if="content"
		class="d-flex flex-column align-center justify-center text-center w-100 h-100 pa-2"
	>
		<v-img v-if="image" :src="image" width="50%" contain />
		<p
			v-if="content?.text?.[locale] && !isEmpty(content.text[locale])"
			class="ma-0 w-100"
		>
			{{ content.text[locale] }}
		</p>
	</v-card-text>
</template>
