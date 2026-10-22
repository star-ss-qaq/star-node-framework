import { IDrive } from "./drive/i-drive.js";
import { SQL } from "./query-build/types.js";
import { QueryRunner } from "./query-runner/index.js";
import { ColumnSchema, ColumnType, InstanceSchema } from "./types/schema.js";

export function formatName(name: string) {
	return name
		.replace(/^[A-Z]/, (x) => x.toLowerCase())
		.replaceAll(/[A-Z]/g, (x) => `_${x.toLowerCase()}`);
}
export class CommonUtils<DB_HIERARCHY extends boolean> {
	constructor(
		private readonly schema: InstanceSchema,
		private readonly drive: IDrive<DB_HIERARCHY>,
	) {}
	handles: Partial<
		Record<
			ColumnType,
			{ toDb?: (value: any) => any; toCode?: (value: any) => any }
		>
	> = {
		"int-datetime": {
			toDb: (value: any) =>
				value && value instanceof Date
					? Math.floor(value.valueOf() / 1000)
					: value,
			toCode: (value: number) => new Date(value * 1000),
		},
	};
	handleCodeValueToDb(schema: ColumnSchema, value: any) {
		const fn = this.handles[schema.type]?.toDb;
		if (fn) {
			return fn(value);
		}
		return value;
	}
	handleDbValueToCode(schema: ColumnSchema, value: any) {
		const fn = this.handles[schema.type]?.toCode;
		if (fn) {
			return fn(value);
		}
		return value;
	}
	defaultRunner: QueryRunner | Promise<QueryRunner> | null = null;
	async getQueryRunner() {
		if (!this.defaultRunner) {
			this.defaultRunner = this.drive.createQueryRunner();
		}
		return this.defaultRunner;
	}
	async queryData(sql: SQL) {
		const runner = await this.getQueryRunner();
		return runner.queryData(sql);
	}
	async exec(sql: SQL) {
		const runner = await this.getQueryRunner();
		return runner.exec(sql);
	}
}
