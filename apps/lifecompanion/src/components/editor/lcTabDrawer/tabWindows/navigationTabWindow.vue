<script lang="ts" setup>
import { mdiMagnify } from "@mdi/js";
</script>

<template>
	<div class="d-flex align-center text-label-medium px-2 py-1">
		<div>Navigation</div>
		<VSpacer />
		<VBtn size="small" :icon="mdiMagnify" />
	</div>
	<VDivider />
	<div class="">
		<template v-for="n in 3" :key="`nav-${n}`">
			<VListItem rounded="lg" :title="`Groupe de page ${n}`" subtitle="3 pages">
				<template #prepend>
					<VResponsive width="50" :aspect-ratio="1" class="me-3">
						<VCard color="#f1f1f1" class="h-100" rounded="lg"></VCard>
					</VResponsive>
				</template>
			</VListItem>
			<VDivider />
		</template>
	</div>
</template>
