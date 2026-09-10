import { readFile } from "fs/promises";
import { PackageInfo, ServerInstance, ServerRuntimeContext } from "./type.js";
import { join } from "path";
import { typeOf, validate } from "@deepkit/type";

async function parsePackage(packagePath: string) {
	try {
		const info = JSON.parse(
			await readFile(join(packagePath, "package-info.json"), "utf8"),
		) as PackageInfo;
		const error = validate(info, typeOf<PackageInfo>());
		if (error?.length) {
			throw new Error(error.map((i) => i.message).join("、"));
		}
		return info;
	} catch (e) {
		throw new Error(`无法识别的包文件: ${(e as Error).message}`);
	}
}

async function loadPackageFromDir(packagePath: string) {
	const packageInfo = await parsePackage(packagePath);
	const mainPath = join(
		packagePath,
		packageInfo.server.dir,
		packageInfo.server.main,
	);
	const m = await import(mainPath);
	const browserDir = join(packagePath, packageInfo.browser.dir);
	const context: ServerRuntimeContext = {
		root: packagePath,
		static: browserDir,
		indexHtml: await readFile(join(browserDir, "index.html"), "utf-8"),
	};
	return {
		...context,
		instances: m.default(context) as ServerInstance,
	};
}
export async function loadPackage(packagePath: string) {
	const info = await loadPackageFromDir(join(process.cwd(), packagePath));

	return info;
}
