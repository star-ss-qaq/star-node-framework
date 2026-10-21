import type { DatabaseSync } from "node:sqlite";
import { QueryRunner } from "../../query-runner/index.js";
import { SQL } from "../../query-build/types.js";
import { InDBIndexSchema } from "../../types/schema.js";

export class SQLiteQueryRunner extends QueryRunner {
	protected _destroy() {
		this.sqlite.close();
	}
	constructor(private sqlite: DatabaseSync) {
		super();
	}
	async queryData<T extends Record<string, any> = Record<string, any>>({
		sql,
		bindings,
	}: SQL) {
		return this.sqlite.prepare(sql).all(...bindings) as T[];
	}
	async exec({ sql, bindings }: SQL) {
		try {
			const { changes, lastInsertRowid } = this.sqlite
				.prepare(sql)
				.run(...bindings);
			return { changed: changes as number, lastInsertRowid };
		} catch (e: any) {
			throw new Error(
				`${e.message}  SQL:${sql},bindings:${bindings.map(String)}`,
			);
		}
	}

	public showDatabases() {
		return [];
	}
	async showTables() {
		const res = await this.queryData<{
			name: string;
		}>({
			sql: "SELECT name FROM sqlite_master WHERE type='table'",
			bindings: [],
		});
		return res.map((i) => i.name);
	}
	async getDBTableSchema(name: string) {
		let primaryKey: string[] = [];
		const [[{ sql: rawSql } = { sql: "" }], columns, indexes] =
			await Promise.all([
				await this.queryData<{ sql: string }>({
					sql: "SELECT sql FROM sqlite_master WHERE `type` = ? AND `name`=?",
					bindings: ["table", name],
				}),
				this.queryData<{
					cid: number;
					name: string;
					type: string;
					notnull: number;
					dflt_value: any;
					pk: number;
				}>({
					sql: `PRAGMA table_info(\`${name}\`)`,
					bindings: [],
				}),
				this.queryData<{
					seq: number;
					name: string;
					unique: 0 | 1;
					origin: "c" | "pk";
					partial: 0;
				}>({
					sql: `PRAGMA index_list(\`${name}\`)`,
					bindings: [],
				}).then(async (res) => {
					const ret: InDBIndexSchema[] = [];
					await Promise.all(
						res.map(async (index) => {
							const indexCol = await this.queryData<{
								seqno: number;
								cid: number;
								name: string;
							}>({
								sql: `PRAGMA index_info(\`${index.name}\`)`,
								bindings: [],
							});
							if (index.origin === "pk") {
								primaryKey = indexCol.map((i) => i.name);
								return;
							}
							ret.push({
								name: index.name,
								type: index.unique ? "UNIQUE INDEX" : "INDEX",
								columns: indexCol.map((i) => i.name),
							});
						}),
					);
					return ret;
				}),
			]);
		const isAITable = rawSql.includes(" AUTOINCREMENT");
		if (isAITable && primaryKey.length === 0) {
			primaryKey = [columns.find((i) => i.pk)!.name];
		}
		return {
			name,
			type: "default",
			primaryKey,
			columns: columns.map((i) => ({
				name: i.name,
				type: i.type,
				nullable: isAITable && Boolean(i.pk) ? false : !i.notnull,
				defaultValue: i.dflt_value === null ? undefined : i.dflt_value,
				autoIncrement: isAITable && Boolean(i.pk),
			})),
			indexes,
		};
	}
}
