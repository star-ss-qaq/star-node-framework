import { QueryRunner } from "../../query-runner/index.js";
import { IDrive } from "../i-drive.js";
import { DBDifference } from "../../types/schema.js";
import {
	defaultDBDifferenceApply,
	defaultDBDifferenceToSql,
} from "../../structure/struct-update-sql-build.js";
import { StructUpdateHelper } from "./struct-update-helper.js";
import {
	TableTypeConvertor,
	ColumnTypeConvertor,
} from "../../types/db-type-convertor.js";
import { SQLiteQueryRunner } from "./query-runner.js";

export class SQLiteOnlyDrive implements IDrive<false> {
	readonly noDbHierarchy = true;
	constructor(private config: { file: string }) {}
	tableTypeConvertor: TableTypeConvertor = {
		default: "DEFAULT",
		mem: "DEFAULT",
	};
	columnTypeConvertor: ColumnTypeConvertor = {
		int: "INTEGER",
		"int-datetime": "INTEGER",
		string: "TEXT",
	};
	async createQueryRunner() {
		const { DatabaseSync } = await import("node:sqlite");
		return new SQLiteQueryRunner(
			new DatabaseSync(this.config.file, { open: true }),
		);
	}

	getUpdateSql(diff: DBDifference[]) {
		return defaultDBDifferenceToSql(diff, StructUpdateHelper);
	}
	async applyChange(queryRunner: QueryRunner, diff: DBDifference[]) {
		return await defaultDBDifferenceApply(
			diff,
			(sql) => queryRunner.exec({ sql, bindings: [] }),
			StructUpdateHelper,
		);
	}
}
