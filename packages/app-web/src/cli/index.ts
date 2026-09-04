import { SFPluging } from "@thestarweb/star-framework-cli";
import { devServer } from "./dev-server.js";

export function SFWebPluging(): SFPluging {
	return {
		name: "sf-web",
		mode: {
			server: {
				side: ["server"],
				dev: devServer,
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createServerInstance",
				},
			},
			browser: {
				side: ["browser"],
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createBrowsweInstance",
				},
			},
		},
	};
}
