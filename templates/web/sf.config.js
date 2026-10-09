// @ts-check
import { SFWebPluging } from "@thestarweb/star-framework-app-web";
import { SFWebVuePlugin } from "@thestarweb/star-framework-app-web-vue";
import { defineConfig } from "@thestarweb/star-framework-cli";
import { bundleAnalyzerPlugin } from "rolldown/experimental";

export default defineConfig({
	pluging: [SFWebPluging(), SFWebVuePlugin()],
	vitePlugin: [bundleAnalyzerPlugin()],
});
