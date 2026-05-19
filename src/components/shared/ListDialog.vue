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
	<v-dialog v-model="isOpen">
		<v-card :rounded="rounded">
			<v-form>
				<v-list v-model="selected">
					<v-list-subheader
						:title="title"
						class="text-title-large font-weight-semibold my-2"
					/>
					<p v-if="subTitle" class="mt-0 mx-4 text-body-medium">
						{{ subTitle }}
					</p>
					<v-divider class="my-2" />
					<template v-for="(section, index) in sections">
						<v-divider v-if="index" class="my-2" />
						<v-list-subheader v-if="section.label" :title="section.label" />
						<v-list-item
							v-for="item in section.items"
							:key="item.id"
							:value="item.id"
							@click="selected = item.id"
						>
							<template #prepend>
								<v-radio v-model="selected" :true-value="item.id" />
							</template>
							<v-list-item-title> {{ item.title }} </v-list-item-title>
							<v-list-item-subtitle v-if="item.description">
								{{ item.description }}
							</v-list-item-subtitle>
						</v-list-item>
					</template>
				</v-list>
			</v-form>
			<v-card-actions>
				<v-spacer />
				<v-btn variant="text" @click="isOpen = false">
					{{ t('shared.actions.close') }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
