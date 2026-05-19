import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import { throttle } from "es-toolkit";
import type { ResolvedConfig } from "vite";
import generateMessagesFiles, { langDir } from "./generateMessagesFiles";

export default function i18nMessagesPlugin() {
	const throttledGenerate = throttle(generateMessagesFiles, 500);
	let config: ResolvedConfig;
	let watcher: FSWatcher | null = null;

	return {
		name: "i18n-messages-plugin",
		configResolved(resolvedConfig: ResolvedConfig) {
			config = resolvedConfig;
		},
		buildStart: async () => {
			await generateMessagesFiles();

			if (config.command === "serve" && !watcher) {
				watcher = chokidar.watch(".", {
					cwd: langDir,
					ignoreInitial: true,
				});

				watcher.on("add", () => {
					throttledGenerate();
				});

				watcher.on("unlink", () => {
					throttledGenerate();
				});
			}
		},
		closeBundle: async () => {
			if (watcher) {
				await watcher.close();
				watcher = null;
			}
		},
	};
}
