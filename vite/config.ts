import path from "node:path";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vuetify from "vite-plugin-vuetify";
import i18nMessagesPlugin from "./plugins/i18nMessagesPlugin";

const root = path.resolve(__dirname, "..");
const host = process.env.TAURI_DEV_HOST;

export const makeViteConfig = (target: "editor" | "player") =>
	defineConfig({
		root: path.resolve(root, "entries", target),
		publicDir: path.resolve(root, "public"),
		plugins: [vue(), vuetify(), i18nMessagesPlugin()],
		resolve: {
			alias: {
				"/src": path.resolve(root, "src"),
			},
		},
		css: {
			preprocessorOptions: {
				scss: {},
			},
		},
		build: {
			outDir: path.resolve(root, "dist", target),
			emptyOutDir: true,
			rollupOptions: {
				input: {
					main: path.resolve(root, "entries", target, "index.html"),
				},
			},
		},
		optimizeDeps: {
			exclude: ["@lifecompanion/model"],
			entries: ["src/**/*.{vue,js,jsx,ts,tsx}"],
		},

		// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
		//
		// 1. prevent Vite from obscuring rust errors
		clearScreen: false,
		// 2. tauri expects a fixed port, fail if that port is not available
		server: {
			port: 1420,
			strictPort: true,
			host: host || false,
			...(host && {
				hmr: {
					protocol: "ws",
					host,
					port: 1421,
				},
			}),
			watch: {
				// 3. tell Vite to ignore watching `src-tauri`
				ignored: ["**/src-tauri/**"],
			},
		},
	});
