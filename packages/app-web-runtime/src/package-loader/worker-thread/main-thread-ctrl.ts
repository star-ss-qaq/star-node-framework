import { Worker, MessagePort } from "worker_threads";
import { extname, join } from "path";
import { Readable } from "node:stream";
import {
	RequestContext,
	RequestProp,
	ResponseData,
} from "../../types/index.js";
import { PackageWorkerThreadLoader } from "./index.js";
import { RemoteCallClient } from "../../remote-call/remote-call-client.js";
import { messagePortToConnection } from "../../remote-call/utile/message-port-to-connection.js";
import { InitMessage, RequestMessage } from "./types.js";

const ext = extname(import.meta.filename);

export class WorkerMainThreadCtrl extends RemoteCallClient {
	handleRequest(prop: RequestProp): Promise<ResponseData> {
		throw new Error("Method not implemented.");
	}
	createConnection() {
		const { port1, port2 } = new MessageChannel();
		this.worker.postMessage({ type: 2, port: port2 } as RequestMessage, [
			port2 as any,
		]);
		return messagePortToConnection(port1,'main');
	}
	private shouldRun = true;

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
					...this.main.config.env,
				},
				argv: this.main.config.arg,
			});
			worker.on("online", () => {
				this.worker.postMessage({
					type: 1,
					mainPath: this.main.mainPath,
					context: this.main.serverRuntimeContext,
				} as InitMessage);
			});
			worker.on("message", (message) => {
				switch (message.type) {
					case "initd":
						this._loading = undefined;
						r();
						this.main.onInsOnline(this);
						break;
					// case "message":
					// 	this.onMessage(message.message);
					// 	break;
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
				console.error("worker has error", error);
			});
			this.worker = worker;
			this._version = this.main.currentVersion;
		});
	}
	constructor(private main: PackageWorkerThreadLoader) {
		super();
		this.load();
	}
	// async sendMessage(message: Uint8Array) {
	// 	this.worker.postMessage(message);
	// }
	kill() {
		this.shouldRun = false;
		this.worker.terminate();
	}
}
