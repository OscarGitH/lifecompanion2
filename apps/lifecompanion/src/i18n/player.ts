import playerMessages from "./messages/player";
import { createI18nTools } from "./shared";

export const [createPlayerI18n, usePlayerI18n] =
	createI18nTools(playerMessages);
