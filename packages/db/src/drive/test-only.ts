import { SQL } from "../query-build/types.js";
import { QueryRunner } from "../query-runner/index.js";
import { IDrive } from "./i-drive.js";

let nextRes: any[] = [];

class TestQueryRunner extends QueryRunner {
	async queryData(sql: SQL) {
		const ret = nextRes;
		nextRes = [];
		return ret;
	}
}

export class TestOnlyDrive implements IDrive {
	constructor(config: {}) {}
	createQueryRunner(): QueryRunner {
		return new TestQueryRunner();
	}
	static setNextRes(data: any[]) {
		nextRes = data;
	}
}
