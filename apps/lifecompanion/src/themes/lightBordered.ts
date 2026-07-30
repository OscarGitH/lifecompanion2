import type { ThemeDefinition } from "vuetify";
import light from "./light";

export const THEME_LIGHT_BORDERED = "lightBordered";

export default {
	...light,
	variables: {
		...light.variables,
		"theme-border":
			"1px solid rgba(var(--v-border-color), var(--v-border-opacity))",
	},
} satisfies ThemeDefinition;
