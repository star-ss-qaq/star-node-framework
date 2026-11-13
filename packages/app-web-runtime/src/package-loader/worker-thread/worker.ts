import { parentPort } from "worker_threads";
import { Readable } from "node:stream";
import {
	RequestContext,
	RequestProp,
	ResponseData,
	ServerInstance,
} from "../../types/index.js";
import { RemoteCallClient } from "../../remote-call/remote-call-client.js";
import { Message } from "./types.js";
import { messagePortToConnection } from "../../remote-call/utile/message-port-to-connection.js";

if (!parentPort) {
	console.error("this code must run in worker");
	process.exit(1);
}

class Worker extends RemoteCallClient {
	createConnection(): any {
		throw new Error("Method not implemented.");
	}
	async handleRequest(prop: RequestProp): Promise<ResponseData> {
		return await this.ins.onRequest(prop);
	}
	constructor(private ins: ServerInstance) {
		super();
	}
}
let w: Worker;
parentPort.on("message", async (message: Message) => {
	switch (message.type) {
		case 1:
			const module = await import(message.mainPath);
			const ins = module.default(message.context);
			w = new Worker(ins);
			parentPort!.postMessage({ type: "initd" });
			break;
		case 2:
			w!.onConnection(messagePortToConnection(message.port, "worker"));
			break;
	}
});
