import { extname, join } from "path";
import { loadPackage } from "./package-loader/index.js";
import {
	RequestProp,
	ResolvedServerInstance,
	ResponseData,
	ServerInstanceConfig,
} from "./types/index.js";
import { open, stat } from "fs/promises";
import { MIMEMap } from "./mime.js";

const abortedReturn = { code: 0, header: {}, data: null };
export const handleRef = {
	value: async () => ({ code: 404, header: {}, data: null }),
} as {
	value: (prop: RequestProp) => Promise<ResponseData>;
};
export async function parseInstancesConfig(instances: ServerInstanceConfig[]) {
	handleRef.value = handle;
	const list = await Promise.all(
		instances.map(async (i): Promise<ResolvedServerInstance> => {
			if ("type" in i || "package" in i) {
				return await loadPackage(i as any);
			}
			return i;
		}),
	);
	const handles = list.filter((i) => i);
	async function handle(prop: RequestProp): Promise<ResponseData> {
		const { url, method, signal, appName } = prop;
		let prefix = "/";
		const instance = handles.find(
			appName
				? (i) => i.name === appName
				: (i) => {
						if (i.matchRequest.host && !i.matchRequest.host.test(url.host))
							return false;
						if (i.matchRequest.prefix) {
							const p = i.matchRequest.prefix.exec(url.pathname);
							if (!p) return false;
							prefix = p[0];
						} else {
							prefix = "/";
						}
						return true;
					},
		);
		if (instance) {
			if (
				method === "GET" &&
				!url.pathname.includes("./") &&
				instance.staticFilePath
			) {
				const path = join(instance.staticFilePath, url.pathname);
				try {
					const s = await stat(path);
					if (s.isFile()) {
						const handle = await open(path, "r");
						const stream = handle.createReadStream();
						stream.on("end", () => handle.close());
						return {
							code: 200,
							header: {
								"content-type":
									MIMEMap[extname(path).substring(1)] ||
									"application/octet-stream",
							},
							data: stream as any,
						};
					}
				} catch {}
			}
			if (signal.aborted) return abortedReturn;
			try {
				return await instance.onRequest(prop);
			} catch (e) {
				console.warn(e);
				return { code: 500, header: {}, data: null };
			}
		}
		return { code: 404, header: {}, data: null };
	}
	return handle;
}
