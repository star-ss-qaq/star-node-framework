import { SQL } from "../query-build/types.js";
import { QueryRunner } from "../query-runner/index.js";
import { defaultDBDifferenceToSql } from "../structure/struct-update-sql-build.js";
import {
	TableTypeConvertor,
	ColumnTypeConvertor,
} from "../types/db-type-convertor.js";
import {
	DBDifference,
	DBDifferenceType,
	DBTableDifference,
	InDBTableSchema,
} from "../types/schema.js";
import { IDrive } from "./i-drive.js";

let nextRes: any[] = [];

class TestQueryRunner extends QueryRunner {
	protected _destroy() {}
	async queryData(sql: SQL) {
		const ret = nextRes;
		nextRes = [];
		return ret;
	}
	async exec(sql: SQL) {
		return { changed: 0, lastInsertRowid: 0 };
	}

	showDatabases() {
		return [];
	}
	showTables() {
		return [];
	}
	getDBTableSchema(name: string, db: string): InDBTableSchema {
		throw new Error("Method not implemented.");
	}
}

export class TestOnlyDrive implements IDrive {
	constructor(config: {}) {}
	tableTypeConvertor: TableTypeConvertor = {
		default: "DEFAULT",
		mem: "DEFAULT",
	};
	readonly noDbHierarchy = false;
	applyChange(
		queryRunner: QueryRunner,
		schema: DBDifference[],
	): void | Promise<void> {
		throw new Error("Method not implemented.");
	}
	createQueryRunner(): QueryRunner {
		return new TestQueryRunner();
	}
	getUpdateSql(diff: DBDifference[]) {
		return defaultDBDifferenceToSql(diff);
	}
	static setNextRes(data: any[]) {
		nextRes = data;
	}
}
