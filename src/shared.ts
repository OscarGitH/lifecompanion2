import { createPinia } from "pinia";
import type { App, Component } from "vue";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import "vuetify/styles";

export function mountApp(
	rootComponent: Component,
	enhanceApp: (app: App<Element>) => void,
) {
	const app = createApp(rootComponent);

	const pinia = createPinia();

	const vuetify = createVuetify({
		icons: {
			defaultSet: "mdi",
			aliases,
			sets: {
				mdi,
			},
		},
	});

	app.use(pinia);
	app.use(vuetify);

	enhanceApp(app);

	app.mount("#app");
}
