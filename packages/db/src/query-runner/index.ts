import { SQL } from "../query-build/types.js";

export abstract class QueryRunner {
	abstract queryData(sql: SQL): Promise<any[]>;
}
