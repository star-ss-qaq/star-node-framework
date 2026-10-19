import { SQL } from "../query-build/types.js";
import { QueryRunner } from "../query-runner/index.js";
import {
	defaultDBDifferenceToSql,
	StructureUpdateSqlBuild,
} from "../structure/struct-update-sql-build.js";
import {
	DBDifference,
	DBDifferenceType,
	DBTableDifference,
	DBTableSchema,
} from "../types/schema.js";
import { IDrive } from "./i-drive.js";

let nextRes: any[] = [];

class TestQueryRunner extends QueryRunner {
	protected _destroy() {}
	async _queryData(sql: SQL) {
		const ret = nextRes;
		nextRes = [];
		return ret;
	}
	async _exec(sql: SQL) {
		return { changed: 0, lastInsertRowid: 0 };
	}
}

export class TestOnlyDrive implements IDrive {
	constructor(config: {}) {}
	readonly noDbHierarchy = false;
	showDatabases() {
		return [];
	}
	showTables() {
		return [];
	}
	getDBTableSchema(name: string, db: string): DBTableSchema {
		throw new Error("Method not implemented.");
	}
	applyChange(schema: DBDifference[]): void | Promise<void> {
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
