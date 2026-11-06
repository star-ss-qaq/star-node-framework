import { Worker } from "worker_threads";
import { RemoteCallClient } from "../../remote-call/remote-call-client.js";
import { extname, join } from "path";
import { Readable } from "node:stream";
import {
	RequestContext,
	ServerInstance,
	ServerRuntimeContext,
} from "../../type.js";
import { FSWatcher, watch } from "node:fs";
import {
	BasePackageLoader,
	CommonPackageConfig,
} from "../base-package-loader.js";

const ext = extname(import.meta.filename);

export class W extends RemoteCallClient {
	private shouldRun = true;
	handleRequest(
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	): Promise<{
		code: number;
		header: any;
		res: Readable | ReadableStream | null;
	}> {
		throw new Error("Method not implemented.");
	}
	private worker!: Worker;
	_loading?: Promise<void>;
	public get loading() {
		return this._loading;
	}
	private startErrorTime = 0;
	_version = 0;
	public get version() {
		return this._version;
	}
	load() {
		this._loading = new Promise((r, reject) => {
			const worker = new Worker(join(import.meta.dirname, `worker${ext}`), {
				env: {
					...process.env,
				},
				argv: [
					this.main.mainPath,
					JSON.stringify(this.main.serverRuntimeContext),
				],
			});
			worker.on("message", (message) => {
				switch (message.type) {
					case "initd":
						this._loading = undefined;
						r();
						this.main.onInsOnline(this);
						break;
					case "message":
						this.onMessage(message.message);
						break;
				}
			});
			worker.on("exit", () => {
				if (this.shouldRun) {
					this.main.onInsError(this);
					if (this.loading) {
						if (++this.startErrorTime > 5) {
							console.error("can not start");
							reject();
							return;
						}
					}
					console.log("worker exit, restart it now ");
					this.load();
				}
			});
			worker.on("error", (error) => {
				console.error("worker has error",error);
			});
			this.worker = worker;
			this._version = this.main.currentVersion;
		});
	}
	constructor(private main: Main) {
		super();
		this.load();
	}
	async sendMessage(message: Uint8Array) {
		this.worker.postMessage(message);
	}
	kill() {
		this.shouldRun = false;
		this.worker.terminate();
	}
}

export class Main extends BasePackageLoader {
	activeIns: W[] = [];
	loadingIns: Set<W> = new Set();
	get loading() {
		if (this.loadingIns.size > 0) {
			return Promise.all([...this.loadingIns].map((i) => i.loading));
		}
	}
	onInsOnline(ins: W) {
		this.activeIns = [...new Set(this.activeIns).add(ins)];
		this.loadingIns.delete(ins);
		if (
			this.activeIns.length + this.loadingIns.size <
			this.config.expectationCount!
		) {
			this.load(true);
		} else {
			if (this.activeIns.length > this.config.expectationCount!) {
				this.activeIns.shift()!.kill();
			}
			if (this.activeIns[0].version < this.currentVersion) {
				// 更新下一个实例
				this.load(true);
			}
		}
	}
	onInsError(ins: W) {
		this.activeIns = this.activeIns.filter((i) => i !== ins);
		this.loadingIns.add(ins);
	}
	async load(isReload: boolean) {
		if (isReload) {
			this.loadingIns.add(new W(this));
		} else {
			for (var i = 0; i < this.config.expectationCount!; i++) {
				this.loadingIns.add(new W(this));
			}
		}
		await this.loading;
	}
	async loadPackageInfo() {
		await super.loadPackageInfo();
		if (!this.config.expectationCount) {
			this.config.expectationCount = 1;
		}
	}
	constructor(
		protected config: CommonPackageConfig & { expectationCount?: number },
	) {
		super(config);
	}
	async onRequest(...prop: Parameters<ServerInstance["onRequest"]>) {
		if (this.activeIns.length === 0) {
			return { code: 500, header: {}, res: null };
		}
		// TODO 如果有多个存活实例，应该做负载均衡，同时可能需要考虑动态扩容
		return this.activeIns[0].onRequest(...prop);
	}
	kill() {
		this.config.expectationCount = 0;
		this.activeIns.forEach((i) => i.kill());
		this.activeIns = [];
		this.loadingIns.forEach((i) => i.kill());
		this.loadingIns.clear();
	}
}
