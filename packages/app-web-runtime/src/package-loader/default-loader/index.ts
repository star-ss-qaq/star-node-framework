import { ServerInstance } from "../../types/instance.js";
import { RequestProp, ResponseData } from "../../types/resolved.js";
import { BasePackageLoader } from "../base-package-loader.js";

export class PackageDefaultLoader extends BasePackageLoader {
  instance!: ServerInstance
	async load(isHoot: boolean) {
		const module = await import(this.mainPath);
		this.instance = await module.default(this.serverRuntimeContext);
	}
	async onRequest(prop: RequestProp): Promise<ResponseData> {
		return await this.instance.onRequest(prop)
	}
	//
}
