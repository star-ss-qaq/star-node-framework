import { WorkerLoader } from "./worker/index.js";

const map = {
	WorkerLoader,
};
export async function loadPackage<T extends keyof typeof map>(
	config:
		| ({ loader: T } & ConstructorParameters<(typeof map)[T]>[0])
		| ConstructorParameters<typeof WorkerLoader>[0],
) {
	const t = new (map as any)[(config as any).loader || "WorkerLoader"](config);
	await t.startLoading;
	return t;
}
