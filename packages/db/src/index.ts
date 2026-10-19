import { IDrive } from "./drive/i-drive.js";
import { RegisteredDriveMap } from "./drive/registered-map.js";
import { QueryBuild } from "./query-build/index.js";
import { StructHelper } from "./structure/index.js";
import { InstanceSchema } from "./types/schema.js";
import { CommonUtils, formatName } from "./utils.js";

type ConnectionConfig = {
	[k in keyof typeof RegisteredDriveMap]: {
		type: k;
	} & ConstructorParameters<(typeof RegisteredDriveMap)[k]>[0];
}[keyof typeof RegisteredDriveMap];

export class SFDB<
	DB_HIERARCHY extends boolean,
	S extends InstanceSchema,
> extends QueryBuild<DB_HIERARCHY, S> {
	readonly commonUtils: CommonUtils<DB_HIERARCHY>;
	readonly structHelper: StructHelper<DB_HIERARCHY>;
	constructor(schema: S, connection: ConnectionConfig) {
		Object.entries(schema.database).forEach(([k, s]) => {
			if (!s.name) s.name = formatName(k);
			Object.entries(s.tables).forEach(([k, s]) => {
				if (!s.name) s.name = formatName(k);
				Object.entries(s.columns).forEach(([k, s]) => {
					if (!s.name) s.name = formatName(k);
				});
			});
		});
		if (!(connection.type in RegisteredDriveMap)) {
			throw new Error(`unknown db drive: ${connection.type}`);
		}
		const drive: any = new RegisteredDriveMap[connection.type](
			connection as any,
		);
		const commonUtils = new CommonUtils(schema, drive);
		super(schema, drive, commonUtils);
		this.commonUtils = commonUtils;
		this.structHelper = new StructHelper(schema, drive, commonUtils);
	}
}
export { And, Or, Raw, Column, Value } from "./query-build/index.js";
