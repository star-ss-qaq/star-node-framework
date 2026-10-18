import { RegisteredDriveMap } from "./drive/registered-map.js";
import { QueryBuild } from "./query-build/index.js";
import { InstanceSchema } from "./types/schema.js";

type ConnectionConfig = {
	[k in keyof typeof RegisteredDriveMap]: {
		type: k;
	} & ConstructorParameters<(typeof RegisteredDriveMap)[k]>[0];
}[keyof typeof RegisteredDriveMap];

export class SFDB<S extends InstanceSchema> extends QueryBuild<S> {
	constructor(schema: S, connection: ConnectionConfig) {
		if (!(connection.type in RegisteredDriveMap)) {
			throw new Error(`unknown db drive: ${connection.type}`);
		}
		const drive = new RegisteredDriveMap[connection.type](connection);
		super(schema, drive);
	}
}
export { And, Or, Raw, Column, Value } from "./query-build/index.js";
