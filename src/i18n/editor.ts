import editorMessages from "./messages/editor";
import { createI18nTools } from "./shared";

export const [createEditorI18n, useEditorI18n] =
	createI18nTools(editorMessages);
