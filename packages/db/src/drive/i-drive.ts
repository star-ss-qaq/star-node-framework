import { QueryRunner } from "../query-runner/index.js";
import {
	ColumnTypeConvertor,
	TableTypeConvertor,
} from "../types/db-type-convertor.js";
import { DBDifference } from "../types/schema.js";

export type IDrive<DB_HIERARCHY = true> = {
	readonly noDbHierarchy: DB_HIERARCHY extends true ? false | undefined : true;
	createQueryRunner(): QueryRunner | Promise<QueryRunner>;
	applyChange(
		queryRunner: QueryRunner,
		schema: DBDifference[],
	): void | Promise<void>;
	getUpdateSql(schema: DBDifference[]): string;
	tableTypeConvertor: TableTypeConvertor;
	columnTypeConvertor?: ColumnTypeConvertor;
};

export function hasDbHierarchy(drive: IDrive<any>): drive is IDrive<true> {
	return !drive.noDbHierarchy;
}
