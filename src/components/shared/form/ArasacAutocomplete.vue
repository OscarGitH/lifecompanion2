<script setup lang="ts">
import type { LcPicto } from "@lifecompanion/model";
import { debounce } from "es-toolkit";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const pictosFound = ref<LcPicto[]>([]);
const isLoadingPictos = ref(false);
const pictoSearchQuery = ref("");

const searchArasac = async (query: string) => {
	if (!query || query.length < 2) {
		pictosFound.value = [];
		return;
	}

	isLoadingPictos.value = true;

	const lang = locale.value.split("-")[0];

	try {
		const response = await fetch(
			`https://api.arasaac.org/v1/pictograms/${lang}/search/${query}`,
		);
		const data = await response.json();

		if (!Array.isArray(data)) {
			pictosFound.value = [];
			return;
		}

		pictosFound.value = data.map((p) => ({
			id: p._id,
			name: p.keywords[0]?.keyword || `Picto ${p._id}`,
			image: `https://static.arasaac.org/pictograms/${p._id}/${p._id}_300.png`,
		}));
	} catch {
		pictosFound.value = [];
	} finally {
		isLoadingPictos.value = false;
	}
};

const debouncedSearch = debounce(searchArasac, 300);

watch(pictoSearchQuery, (newVal) => {
	debouncedSearch(newVal);
});
</script>

<template>
	<v-autocomplete
		:items="pictosFound"
		:loading="isLoadingPictos"
		v-model:search="pictoSearchQuery"
		item-title="name"
		item-value="id"
		return-object
		hide-no-data
		clearable
	>
		<template #item="{ props, item }">
			<v-list-item v-bind="{...props, ...(item.name && {title: item.name})}">
				<template v-slot:prepend>
					<v-avatar :image="item.image" rounded="0" />
				</template>
			</v-list-item>
		</template>

		<template #chip="{ item }">
			<v-avatar :image="item.image" rounded="0" />
		</template>
	</v-autocomplete>
</template>
