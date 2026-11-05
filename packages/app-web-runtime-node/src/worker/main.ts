import { Worker } from "worker_threads";
import { RemoteCallClient } from "../remote-call/remote-call-client.js";
import { extname, join } from "path";
import { Readable } from "node:stream";
import { RequestContext } from "../type.js";

const ext = extname(import.meta.filename);

export class Main extends RemoteCallClient {
	public shouldRun = true;
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
	worker: Worker | null = null;
	loading?: Promise<void>;
	load() {
		this.loading = new Promise((r) => {
			const worker = new Worker(join(import.meta.dirname, `worker${ext}`), {
				env: {
					...process.env,
				},
				argv: [this.mainPath, JSON.stringify(this.context)],
			});
			worker.on("message", (message) => {
				switch (message.type) {
					case "initd":
						r();
						break;
					case "message":
						this.onMessage(message.message);
						break;
				}
			});
			worker.on("exit", () => {
				console.log("worker exit, restart it now ");
				this.worker = null;
				this.load();
			});
			worker.on("error", () => {
				console.error("worker has error");
			});
			this.worker = worker;
		});
	}
	constructor(
		private mainPath: string,
		private context: any,
	) {
		super();
		this.load();
	}
	async sendMessage(message: Uint8Array) {
		if (!this.worker) {
			await this.loading;
		}
		this.worker?.postMessage(message);
	}
	//
}
