import type { SFPluging } from "@thestarweb/star-framework-cli";
import vuePlugin from "@vitejs/plugin-vue";

export function SFWebVuePlugin(): SFPluging {
	return {
		name: "sf-web-vue",
		vitePlugin: vuePlugin(),
	};
}
