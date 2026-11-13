import { PackageDefaultLoader } from "./default-loader/index.js";
import { PackageWorkerThreadLoader } from "./worker-thread/index.js";

const map = {
	Default: PackageDefaultLoader,
	WorkerThread: PackageWorkerThreadLoader,
};
export async function loadPackage<T extends keyof typeof map>(
	config:
		| ({
				/**
				 * 指定应用加载方式
				 * - `Default` 默认标准加载方式，直接讲程序import到运行库中，简单高效，但是不支持热更新、崩溃重启，无隔离
				 * - `WorkerThread` 使用WorkerThreads加载，存在可控的性能损耗，但能支持热更新、独立环境变量等参数，同时支持多实例、示例崩溃自动重启等
				 */
				loader: T;
		  } & ConstructorParameters<(typeof map)[T]>[0])
		| ConstructorParameters<typeof PackageWorkerThreadLoader>[0],
) {
	const t = new (map as any)[(config as any).loader || "Default"](config);
	await t.startLoading;
	return t;
}
