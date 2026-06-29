import { defineConfig } from "vitest/config";
import { deepkitType } from "@deepkit/vite";

export default defineConfig({
	plugins: [deepkitType()],
	test: {
		globals: true,
		environment: "node",
	},
});
