import AppEditor from "./AppEditor.vue";
import { createEditorI18n } from "./i18n/editor";
import { mountApp } from "./shared";

mountApp(AppEditor, (app) => {
	app.use(createEditorI18n());
});
