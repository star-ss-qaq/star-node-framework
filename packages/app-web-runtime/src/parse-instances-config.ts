import { loadPackage } from "./package-loader/index.js";
import { ResolvedServerInstance, ServerInstanceConfig } from "./types/index.js";

export async function parseInstancesConfig(instances: ServerInstanceConfig[]) {
	const list = await Promise.all(
		instances.map(async (i): Promise<ResolvedServerInstance> => {
			if ("type" in i || "package" in i) {
				return await loadPackage(i as any);
			}
			return i;
		}),
	);
	return list.filter((i) => i);
}
