import { Connection, ResultSetHeader } from "mysql2/promise";
import { SQL } from "../../query-build/types.js";
import { QueryRunner } from "../../query-runner/index.js";
import { DBExecResult } from "../../types/index.js";
import { InDBIndexSchema, InDBTableSchema } from "../../types/schema.js";

export class MysqlQueryRunner extends QueryRunner {
	constructor(private connection: Connection) {
		super();
	}
	public async queryData<T extends {} = any>(sql: SQL): Promise<T[]> {
		const [res] = await this.connection.execute<any[]>(sql.sql, sql.bindings);
		return res;
	}
	public async exec(sql: SQL) {
		const [res] = await (sql.bindings.length
			? this.connection.execute<ResultSetHeader>(sql.sql, sql.bindings)
			: this.connection.query<ResultSetHeader>(sql.sql));
		return {
			changed: res.affectedRows || 0,
			lastInsertRowid: res.insertId || 0,
		};
	}
	public async showDatabases() {
		const [res] = await this.connection.execute<any[]>("SHOW DATABASES");
		return res.map((i) => i.Database);
	}
	public async showTables(db: string) {
		const [res] = await this.connection.execute<any[]>(
			`SHOW TABLES FROM \`${db}\``,
		);
		return res.map((i) => i[`Tables_in_${db}`]);
	}
	public async getDBTableSchema(
		name: string,
		db: string,
	): Promise<InDBTableSchema> {
		const [columns, indexesRaw] = await Promise.all([
			this.queryData<{
				Field: string;
				Type: string;
				Null: "YES" | "NO";
				Key: string;
				Default: any;
				Extra: string;
			}>({ sql: `DESC \`${db}\`.${name}`, bindings: [] }),
			this.queryData<{
				Table: string;
				Non_unique: number;
				Key_name: string;
				Seq_in_index: number;
				Column_name: string;
				Collation: "A";
				Cardinality: 0;
				Sub_part: null;
				Packed: null;
				Null: "";
				Index_type: "BTREE";
				Comment: string;
				Index_comment: string;
			}>({ sql: `SHOW INDEX IN \`${db}\`.${name}`, bindings: [] }),
		]);
		const index: Record<string, InDBIndexSchema> = Object.create(null);
		indexesRaw.forEach((i) => {
			if (!index[i.Key_name]) {
				index[i.Key_name] = {
					name: i.Key_name,
					type:
						i.Index_type == "BTREE" || i.Index_type == "HASH"
							? i.Key_name == "PRIMARY"
								? "PRIMARY"
								: i.Non_unique
									? "INDEX"
									: "UNIQUE"
							: i.Index_type,
					columns: [],
				};
				index[i.Key_name].columns[i.Seq_in_index - 1] = i.Column_name;
			}
		});
		return {
			name,
			type: "default",
			columns: columns.map((i) => ({
				type: i.Type.toLocaleUpperCase(),
				name: i.Field,
				defaultValue: i.Default,
				nullable: i.Null !== "NO",
				autoIncrement: i.Extra === "auto_increment",
			})),
			indexes: Object.values(index).filter((i) => i.name !== "PRIMARY"),
			primaryKey: index.PRIMARY?.columns || [],
		};
	}
	protected _destroy() {
		this.connection.destroy();
	}
	//
}
