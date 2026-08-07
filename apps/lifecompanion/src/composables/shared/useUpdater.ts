import { check, type Update } from "@tauri-apps/plugin-updater";
import { useSnackbarStore } from "../../stores/shared/useSnackbarStore";

const downloadUpdate = async (update: Update) => {
	const snackbarStore = useSnackbarStore();

	let downloaded = 0;
	let contentLength = 0;

	const progressMessage = {
		text: `Téléchargement de la mise à jour ${update.version}...`,
		timeout: -1,
	};

	snackbarStore.queue.push(progressMessage);

	await update.downloadAndInstall((event) => {
		switch (event.event) {
			case "Started":
				contentLength = event.data.contentLength ?? 0;
				break;

			case "Progress": {
				downloaded += event.data.chunkLength;

				const pct = contentLength
					? Math.round((downloaded / contentLength) * 100)
					: null;

				progressMessage.text = `Téléchargement de la mise à jour ${update.version}...${pct ? ` ${pct}%` : ""}`;
				break;
			}

			case "Finished": {
				const index = snackbarStore.queue.indexOf(progressMessage);

				if (index !== -1) {
					snackbarStore.queue.splice(index, 1);
				}

				snackbarStore.queue.push(
					"Mise à jour installée. Redémarrez l'application pour l'appliquer.",
				);
				break;
			}
		}
	});
};

export const useUpdater = () => {
	const checkForUpdates = async () => {
		try {
			const update = await check();

			if (update) {
				await downloadUpdate(update);
			}
		} catch (error) {
			console.error("Update check failed:", error);
		}
	};

	return {
		checkForUpdates,
	};
};
