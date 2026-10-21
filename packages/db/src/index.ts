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
		Object.entries(schema.database).forEach(([dbCodeName, dbSchema]) => {
			if (!dbSchema.name) dbSchema.name = formatName(dbCodeName);
			Object.entries(dbSchema.tables).forEach(
				([tableCodeName, tableSchema]) => {
					if (!tableSchema.name) tableSchema.name = formatName(tableCodeName);
					const aiKeys: string[] = [];
					Object.entries(tableSchema.columns).forEach(([k, s]) => {
						if (!s.name) s.name = formatName(k);
						if (s.autoIncrement) aiKeys.push(k);
					});
					if (aiKeys.length > 1) {
						throw new Error(
							`一张表最多只支持一个autoIncrement的列，在表${dbCodeName}.${tableCodeName},字段${aiKeys.join(",")}`,
						);
					} else if (aiKeys.length === 1) {
						if (tableSchema.primaryKey) {
							if (
								typeof tableSchema.primaryKey === "string"
									? tableSchema.primaryKey === aiKeys[0]
									: tableSchema.primaryKey.length !== 1 ||
										tableSchema.primaryKey[0] !== aiKeys[0]
							) {
								throw new Error(
									`表${dbCodeName}.${tableCodeName}的primaryKey设置字段与autoIncrement冲突。primaryKey必须为autoIncrement字段或不设置`,
								);
							}
						} else {
							tableSchema.primaryKey = aiKeys;
						}
					}
				},
			);
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
