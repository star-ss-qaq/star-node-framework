import { SFDevHook } from "@thestarweb/star-framework-cli";
import { createHttpServer } from "../runtime/index.js";

export function devServer(): SFDevHook {
	let server: Awaited<ReturnType<typeof createHttpServer>>;
	return {
		async onStart(main) {
			server = await createHttpServer({
				instances: [{ main }],
				port: 3000,
			});
		},
		async onHotReload(main) {
			if (server) {
				await server.updateinstances([{ main }]);
				console.log("hot updated");
			}
		},
	};
}
