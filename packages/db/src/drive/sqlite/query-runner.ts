import type { DatabaseSync } from "node:sqlite";
import { QueryRunner } from "../../query-runner/index.js";
import { SQL } from "../../query-build/types.js";

export class SQLiteQueryRunner extends QueryRunner {
	protected _destroy() {
		this.sqlite.close();
	}
	constructor(private sqlite: DatabaseSync) {
		super();
	}
	async queryData({ sql, bindings }: SQL) {
		return this.sqlite.prepare(sql).all(...bindings);
	}
	async exec({ sql, bindings }: SQL) {
		const { changes, lastInsertRowid } = this.sqlite
			.prepare(sql)
			.run(...bindings);
		return { changed: changes as number, lastInsertRowid };
	}

	public showDatabases() {
		return [];
	}
	async showTables() {
		const res = (await this.queryData({
			sql: "SELECT name FROM sqlite_master WHERE type='table'",
			bindings: [],
		})) as {
			name: string;
		}[];
		return res.map((i) => i.name);
	}
	async getDBTableSchema(name: string) {
		const res = (await this.queryData({
			sql: `PRAGMA table_info(\`${name}\`)`,
			bindings: [],
		})) as {
			cid: number;
			name: string;
			type: string;
			notnull: number;
			dflt_value: any;
			pk: number;
		}[];
		return {
			name,
			type: "default",
			primaryKey: [],
			columns: res.map((i) => ({
				name: i.name,
				type: i.type,
				nullable: !i.notnull,
				defaultValue: i.dflt_value === null ? undefined : i.dflt_value,
				autoIncrement: false,
			})),
		};
	}
}
