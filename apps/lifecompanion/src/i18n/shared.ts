import { mapValues } from "es-toolkit";
import type { Ref } from "vue";
import { createI18n, useI18n } from "vue-i18n";
import sharedMessages from "./messages/shared";

export type I18nLocale = keyof typeof sharedMessages;

type I18nSharedMessage = (typeof sharedMessages)[I18nLocale];

const createI18nComposable =
	<MessagesSchema>() =>
	() => {
		const { t, locale } = useI18n<{ message: MessagesSchema }, I18nLocale>({
			useScope: "global",
		});

		return {
			t: t as typeof t<never>,
			locale: locale as Ref<I18nLocale>,
		};
	};

export const createI18nTools = <MessagesSchema>(
	messages: Record<I18nLocale, MessagesSchema>,
) =>
	[
		() =>
			createI18n<[MessagesSchema & I18nSharedMessage], I18nLocale>({
				legacy: false,
				locale: "fr-FR",
				messages: mapValues(messages, (localeMessages, locale) => ({
					...localeMessages,
					...sharedMessages[locale],
				})),
			}),
		createI18nComposable<MessagesSchema & I18nSharedMessage>(),
	] as const;

export const useSharedI18n = createI18nComposable<I18nSharedMessage>();
