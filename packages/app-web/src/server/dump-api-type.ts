import { getConfig } from "@thestarweb/star-framework-cli";
import { getFlatRoute } from "../route/index.js";
import { dirname, relative } from "path";
import { writeFile } from "fs/promises";
import { paramMeta } from "../params/index.js";
import { dumpTSType } from "@thestarweb/star-framework-param-helper";

export async function dumpRouteType(file: string, obj: object) {
	const routes = getFlatRoute(obj);
	const config = getConfig()!;
	const data = [];
	let rPath = relative(dirname(file), config.entry).replaceAll("\\", "/");
	if (!rPath.startsWith(".")) {
		rPath = `./${rPath}`;
	}
	data.push(`import App from ${JSON.stringify(rPath)};`);
	data.push(`declare module '@thestarweb/star-framework-app-web'{`);
	data.push(`\tinterface ProjectApi{`);
	Object.keys(routes).forEach((type) => {
		if (type === "__SF:NotFind") return;
		data.push(`\t\t${type}:{`);
		routes[type as keyof typeof routes]!.forEach((meta, path) => {
			if (!meta.finalRoute) return;
			data.push(`\t\t\t${JSON.stringify(path)}:{`);
			const { obj, propertyKey } = meta.finalRoute;
			if (typeof (obj as any)[propertyKey] === "function") {
				data.push(`\t\t\t\tprop:{`);
				const param = paramMeta.getParamMetadata(
					meta.finalRoute.obj,
					meta.finalRoute.propertyKey,
				);
				if (param.types.body) {
					data.push(
						`\t\t\t\t\tbody${param.types.body.required ? "" : "?"}:${dumpTSType(param.types.body.type)},`,
					);
				}
				if (param.types.query) {
					data.push(
						`\t\t\t\t\tquery${param.types.query.required ? "" : "?"}:${dumpTSType(param.types.query.type)},`,
					);
				}
				if (param.types.header) {
					data.push(
						`\t\t\t\t\theader${param.types.header.required ? "" : "?"}:${dumpTSType(param.types.header.type)},`,
					);
				}
				data.push(`\t\t\t\t},`);
				data.push(
					`\t\t\t\treturn:ReturnType<App${meta.allRoute.map((r) => `[${JSON.stringify(r.propertyKey)}]`).join("")}>`,
				);
			} else {
				data.push(`\t\t\t\tprop:{},`);
				data.push(
					`\t\t\t\treturn:App${meta.allRoute.map((r) => `[${JSON.stringify(r.propertyKey)}]`).join("")}`,
				);
			}
			data.push(`\t\t\t},`);
		});
		data.push(`\t\t}`);
	});
	data.push(`\t}`);
	data.push(`}`);
	await writeFile(file, data.join("\n"));
}
