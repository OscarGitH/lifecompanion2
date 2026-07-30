import type { ThemeDefinition } from "vuetify";

export const THEME_LIGHT = "light";

export default {
	dark: false,
	colors: {
		background: "#F4F8FF",
		"on-background": "#011234",
		"on-surface": "#011234",
		primary: "#022977",
		"on-primary": "#ffffff",
		secondary: "#0346CA",
		"on-secondary": "#ffffff",
		tertiary: "#FA624A",
		"on-tertiary": "#ffffff",
	},
	variables: {
		"theme-radius-xl": "24px",
		"theme-radius-md": "12px",
		"theme-border": "none",
	},
} satisfies ThemeDefinition;
