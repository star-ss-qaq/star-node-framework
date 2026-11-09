import { ServerRuntimeContext } from "../../types/index.js";

export interface InitMessage {
	type: 1;
	mainPath: string;
	context: ServerRuntimeContext;
}
export interface RequestMessage {
	type: 2;
	port: MessagePort;
}
export type Message = InitMessage | RequestMessage;
