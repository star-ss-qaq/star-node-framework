// @ts-check
import { SFWebPlugin } from "@thestarweb/star-framework-app-web";
import { SFWebVuePlugin } from "@thestarweb/star-framework-app-web-vue";
import { defineConfig } from "@thestarweb/star-framework-cli";

export default defineConfig({
	plugin: [SFWebPlugin(), SFWebVuePlugin()],
});
