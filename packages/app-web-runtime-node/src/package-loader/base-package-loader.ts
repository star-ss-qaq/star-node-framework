import { Readable } from "node:stream";
import {
	PackageInfo,
	RequestContext,
	ResolvedServerInstanceConfig,
	ServerRuntimeContext,
} from "../type.js";
import { isAbsolute, join } from "node:path";
import { readFile } from "node:fs/promises";
import { typeOf, validate } from "@deepkit/type";
import { FSWatcher, watch } from "node:fs";

export interface CommonPackageConfig {
	package: string;
	prefix?: string | ((url: URL) => string) | undefined;
	if?: ((url: URL) => boolean) | undefined;
	important?: number | undefined;
}

export abstract class BasePackageLoader implements ResolvedServerInstanceConfig {
	private _running = true;
	private _packagePath!: string;
	private _packageInfo!: PackageInfo;
	private _mainPath!: string;
	get mainPath() {
		return this._mainPath;
	}
	serverRuntimeContext!: ServerRuntimeContext;
	staticFilePath?: string | undefined;
	async loadPackageInfo() {
		this._packagePath = isAbsolute(this.config.package)
			? this.config.package
			: join(process.cwd(), this.config.package);
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
	}

	get prefix() {
		return this.config.prefix;
	}
	get if() {
		return this.config.if;
	}
	get important() {
		return this.config.important;
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
	constructor(protected config: CommonPackageConfig) {
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
	abstract onRequest(
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	): Promise<
		| {
				code: number;
				header: any;
				res: Readable | ReadableStream<Uint8Array> | null;
		  }
		| undefined
	>;
}
