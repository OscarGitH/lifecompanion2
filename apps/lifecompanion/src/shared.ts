import { createPinia } from "pinia";
import type { App, Component } from "vue";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import { createCssTransition } from "vuetify/util/transitions";
import themes from "./themes";
import { THEME_LIGHT } from "./themes/light";

import "unfonts.css";
import "./sass/app.scss";

const customTransitions = [
	"slide-fade-y-transition",
	"slide-fade-y-reverse-transition",
	"slide-fade-x-transition",
	"slide-fade-x-reverse-transition",
];

export const mountApp = (
	rootComponent: Component,
	enhanceApp: (app: App<Element>) => void,
) => {
	const app = createApp(rootComponent);

	const pinia = createPinia();

	customTransitions.forEach((transition) => {
		createCssTransition(transition);
	});

	const vuetify = createVuetify({
		theme: {
			defaultTheme: THEME_LIGHT,
			themes,
		},
		defaults: {
			VBtn: { variant: "text" },
			VCard: { elevation: 0 },
			VField: { color: "secondary" },
		},
		icons: {
			defaultSet: "mdi",
			aliases,
			sets: { mdi },
		},
	});

	app.use(pinia);
	app.use(vuetify);

	enhanceApp(app);

	app.mount("#app");
};
