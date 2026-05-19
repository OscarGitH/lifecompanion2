import { defineConfig } from "vite";
import { makeViteConfig } from "./vite/config";

export default defineConfig(() => {
	const config = makeViteConfig("player");

	return {
		...config,
	};
});
