import { QueryRunner } from "../query-runner/index.js";
import { DBDifference, DBTableSchema } from "../types/schema.js";

export type IDrive<DB_HIERARCHY = true> = {
	readonly noDbHierarchy: DB_HIERARCHY extends true ? false | undefined : true;
	createQueryRunner(): QueryRunner | Promise<QueryRunner>;
	showTables(
		db: DB_HIERARCHY extends true ? string : never,
	): string[] | Promise<string[]>;
	getDBTableSchema(
		name: string,
		db: DB_HIERARCHY extends true ? string : never,
	): DBTableSchema | Promise<DBTableSchema>;
	applyChange(schema: DBDifference[]): void | Promise<void>;
	getUpdateSql(schema: DBDifference[]): string;
} & (DB_HIERARCHY extends true ? { showDatabases(): string[] } : {});

export function hasDbHierarchy(drive: IDrive<any>): drive is IDrive<true> {
	return !drive.noDbHierarchy;
}
