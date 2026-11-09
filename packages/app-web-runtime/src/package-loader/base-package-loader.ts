import { Readable } from "node:stream";
import {
	PackageInfo,
	RequestProp,
	ResolvedServerInstance,
	ResponseData,
	ServerRuntimeContext,
} from "../types/index.js";
import { isAbsolute, join } from "node:path";
import { readFile } from "node:fs/promises";
import { typeOf, validate } from "@deepkit/type";
import { FSWatcher, watch } from "node:fs";

export interface CommonPackageConfig {
	package: string;
	host?: string | RegExp | (string | RegExp)[];
	prefix?: string | RegExp | (string | RegExp)[];
	ip?: string | RegExp | (string | RegExp)[];
	important?: number | undefined;
	name?: string;
}

function strToReg(str: string, matchEnd: boolean) {
	return new RegExp(
		`^${str.replace(/([\.\[\]\(\)\^\$\+\*\{\}\|\\])/g, "\\$1")}${matchEnd ? "$" : ""}`,
	);
}
function mergeToReg(
	config: string | RegExp | (string | RegExp)[],
	matchEnd = true,
) {
	if (Array.isArray(config)) {
		return new RegExp(
			config
				.map(
					(i) => `(${i instanceof RegExp ? i.source : strToReg(i, matchEnd)})`,
				)
				.join("|"),
		);
	}
	if (config instanceof RegExp) return config;
	return strToReg(config, matchEnd);
}

export abstract class BasePackageLoader implements ResolvedServerInstance {
	private _running = true;
	private _packagePath!: string;
	private _packageInfo!: PackageInfo;
	private _mainPath!: string;
	public get name() {
		return this._config.name || this._packageInfo.name;
	}
	get mainPath() {
		return this._mainPath;
	}
	serverRuntimeContext!: ServerRuntimeContext;
	staticFilePath?: string | undefined;
	async loadPackageInfo() {
		this._packagePath = isAbsolute(this._config.package)
			? this._config.package
			: join(process.cwd(), this._config.package);
		const info = JSON.parse(
			await readFile(join(this._packagePath, "package-info.json"), "utf8"),
		) as PackageInfo;
		if (!this._running) return;
		const error = validate(info, typeOf<PackageInfo>());
		if (error?.length) {
			throw new Error(error.map((i) => i.message).join("、"));
		}
		this._packageInfo = info;
		this._mainPath = join(this._packagePath, info.server.dir, info.server.main);
		const browserDir = join(this._packagePath, info.browser.dir);
		this.serverRuntimeContext = {
			root: this._packagePath,
			static: browserDir,
			indexHtml: await readFile(join(browserDir, "index.html"), "utf-8"),
		};
		if (!this._running) return;
		this.staticFilePath = browserDir;
		this.matchRequest.host = this.config.host
			? mergeToReg(this.config.host)
			: undefined;
		this.matchRequest.prefix = this.config.prefix
			? mergeToReg(this.config.prefix, false)
			: undefined;
		this.matchRequest.ip = this.config.ip
			? mergeToReg(this.config.ip)
			: undefined;
	}
	get important() {
		return this._config.important;
	}
	abstract load(isHoot: boolean): void | Promise<void>;
	private watchHandle!: FSWatcher;
	currentVersion = Date.now();
	reloadTimeout?: NodeJS.Timeout;
	lazyCheck() {
		if (this.currentVersion + 5000 > Date.now()) {
			if (!this.reloadTimeout) {
				this.reloadTimeout = setTimeout(() => {
					this.reloadTimeout = undefined;
					this.lazyCheck();
				}, 5200);
			}
		} else {
			this.loadPackageInfo().then(() => {
				if (this._running) {
					this.load(true);
				}
			});
		}
	}
	startLoading: Promise<void>;
	public get config() {
		return this._config;
	}
	constructor(protected _config: CommonPackageConfig) {
		this.startLoading = this.loadPackageInfo().then(() => {
			if (!this._running) return;
			this.watchHandle = watch(
				this._packagePath,
				{ recursive: true },
				(type, file) => {
					if (file?.endsWith(".js")) {
						this.currentVersion = Date.now();
						this.lazyCheck();
					}
				},
			);
			return this.load(false);
		});
	}
	matchRequest: ResolvedServerInstance["matchRequest"] = {};
	destroy?(): void {
		throw new Error("Method not implemented.");
	}
	abstract onRequest(prop: RequestProp): Promise<ResponseData>;
}
