import { parentPort } from "worker_threads";
import { RemoteCallClient } from "../../remote-call/remote-call-client.js";
import { Readable } from "node:stream";
import { RequestContext, ServerInstance } from "../../type.js";

if (!parentPort) {
	console.error("this code must run in worker");
	process.exit(1);
}

class Worker extends RemoteCallClient {
	async handleRequest(
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
		return (
			(await this.ins.onRequest(method, url, header, body, context)) || {
				code: 200,
				header: {},
				res: null,
			}
		);
	}
	constructor(private ins: ServerInstance) {
		super();
		parentPort!.on("message", (message) => {
			this.onMessage(message);
		});
	}
	sendMessage(message: Uint8Array): void {
		parentPort!.postMessage({ type: "message", message });
	}
}

const module = await import(process.argv[2]);
const ins = module.default(JSON.parse(process.argv[3]));
new Worker(ins);
parentPort!.postMessage({ type: "initd" });
