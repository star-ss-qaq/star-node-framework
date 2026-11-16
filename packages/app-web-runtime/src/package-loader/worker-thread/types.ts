import { ServerRuntimeContext } from "../../types/index.js";

export interface InitMessage {
	type: 1;
	mainPath: string;
	context: Omit<ServerRuntimeContext, "innerCall">;
}
export interface InitdMessage {
	type: 3;
}
export interface RequestMessage {
	type: 2;
	port: MessagePort;
}
export type Message = InitMessage | RequestMessage | InitdMessage;
