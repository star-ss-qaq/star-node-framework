// @ts-check
import { SFWebPlugin } from "@thestarweb/star-framework-app-web";
import { SFWebVuePlugin } from "@thestarweb/star-framework-app-web-vue";
import { defineConfig } from "@thestarweb/star-framework-cli";

export default defineConfig({
	plugin: [
		SFWebPlugin({
			devServer: {
				instances: [
					{
						matchRequest: {
							host: /\0/,
						},
						name: "test",
						async onRequest(prop) {
							return {
								code: 200,
								header: {},
								data: new ReadableStream({
									start(ctrl) {
										ctrl.enqueue(Buffer.from(JSON.stringify({ test: 1 })));
										ctrl.close();
									},
								}),
							};
						},
					},
				],
			},
		}),
		SFWebVuePlugin(),
	],
});
