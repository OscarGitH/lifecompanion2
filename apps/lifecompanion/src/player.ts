import AppPlayer from "./AppPlayer.vue";
import { createPlayerI18n } from "./i18n/player";
import { mountApp } from "./shared";

mountApp(AppPlayer, (app) => {
	app.use(createPlayerI18n());
});
