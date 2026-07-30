/// <reference types="vite/client" />

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	// biome-ignore lint/complexity/noBannedTypes: Generic Vue shim
	// biome-ignore lint/suspicious/noExplicitAny: Generic Vue shim
	const component: DefineComponent<{}, {}, any>;
	export default component;
}
