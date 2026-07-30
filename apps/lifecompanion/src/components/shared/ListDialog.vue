<script lang="ts" setup>
import { ref, watch } from "vue";
import { useSharedI18n } from "../../i18n/shared";

const { t } = useSharedI18n();

export interface LcListDialogItem {
	id: string;
	title: string;
	description?: string;
}

export interface LcListDialogSection {
	label?: string;
	items: LcListDialogItem[];
}

const { rounded = true } = defineProps<{
	title: string;
	subTitle?: string;
	sections?: LcListDialogSection[];
	rounded?: string | number | boolean;
}>();

const isOpen = defineModel<boolean>({ default: false });

const emit = defineEmits<(e: "select", value: string) => void>();

const selected = ref<string>();

watch(isOpen, () => (selected.value = undefined));

watch(selected, (value) => {
	if (value) emit("select", value);
});
</script>

<template>
	<VDialog v-model="isOpen">
		<VCard :rounded="rounded">
			<VForm>
				<VList v-model="selected">
					<VListSubheader
						:title="title"
						class="text-title-large font-weight-semibold my-2"
					/>
					<p v-if="subTitle" class="mt-0 mx-4 text-body-medium">
						{{ subTitle }}
					</p>
					<VDivider class="my-2" />
					<template v-for="(section, index) in sections">
						<VDivider v-if="index" class="my-2" />
						<VListSubheader v-if="section.label" :title="section.label" />
						<VListItem
							v-for="item in section.items"
							:key="item.id"
							:value="item.id"
							@click="selected = item.id"
						>
							<template #prepend>
								<VRadio v-model="selected" :true-value="item.id" />
							</template>
							<VListItemTitle> {{ item.title }} </VListItemTitle>
							<VListItemSubtitle v-if="item.description">
								{{ item.description }}
							</VListItemSubtitle>
						</VListItem>
					</template>
				</VList>
			</VForm>
			<VCardActions>
				<VSpacer />
				<VBtn variant="text" @click="isOpen = false">
					{{ t('shared.actions.close') }}
				</VBtn>
			</VCardActions>
		</VCard>
	</VDialog>
</template>
