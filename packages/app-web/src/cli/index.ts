import { type SFPluging } from "@thestarweb/star-framework-cli";
import { devServer } from "./dev-server.js";
export * from "./types.js";
export function SFWebPluging(): SFPluging {
	return {
		name: "sf-web",
		mode: {
			server: {
				side: ["server"],
				dev: devServer,
				environments: {},
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createServerInstance",
				},
			},
			browser: {
				side: ["browser", "client"],
				environments: { consumer: "client" },
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createBrowsweInstance",
				},
			},
		},
	};
}
