import { PackageWorkerLoader } from "./worker/index.js";

const map = {
	Worker: PackageWorkerLoader,
};
export async function loadPackage<T extends keyof typeof map>(
	config:
		| ({ loader: T } & ConstructorParameters<(typeof map)[T]>[0])
		| ConstructorParameters<typeof PackageWorkerLoader>[0],
) {
	const t = new (map as any)[(config as any).loader || "Worker"](config);
	await t.startLoading;
	return t;
}
