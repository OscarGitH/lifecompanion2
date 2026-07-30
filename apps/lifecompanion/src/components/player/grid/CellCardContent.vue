<script setup lang="ts">
import type { LcCellContentSchema, SchemaRecord } from "@lifecompanion/model";
import { isEmpty } from "es-toolkit/compat";
import { computed, onUnmounted } from "vue";
import { usePlayerI18n } from "../../../i18n/player";

const { locale } = usePlayerI18n();

const { content } = defineProps<{
	content: SchemaRecord<LcCellContentSchema>;
}>();

let imgUrl: string | null = null;

const image = computed<string | undefined>(() => {
	if (content?.imageBlob instanceof Blob) {
		imgUrl = URL.createObjectURL(content.imageBlob);
		return imgUrl;
	}

	return (
		content?.picto?.image ||
		(content?.imageBase64 && `data:image/png;base64,${content.imageBase64}`) ||
		undefined
	);
});

onUnmounted(() => {
	if (imgUrl) URL.revokeObjectURL(imgUrl);
});
</script>

<template>
	<VCardText
		class="d-flex flex-column align-center justify-center text-center w-100 h-100 pa-2"
	>
		<VImg v-if="image" :src="image" width="50%" contain draggable="false" />
		<p
			v-if="content.text?.[locale] && !isEmpty(content.text[locale])"
			class="ma-0 w-100"
		>
			{{ content.text[locale] }}
		</p>
	</VCardText>
</template>
