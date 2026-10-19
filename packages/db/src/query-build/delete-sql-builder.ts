import { RelTableInfo } from "../types/helpers/table.js";
import { InstanceSchema } from "../types/schema.js";
import { RelTableInCode, SQL } from "./types.js";
import { QueryBuilderUtils } from "./utils/index.js";
import { WhereProp } from "./utils/where.js";

export class DeleteQueryBuild<
	DB_HIERARCHY extends boolean,
	S extends InstanceSchema,
	TABLE extends Record<string, RelTableInfo<any, any, any>>,
> {
	constructor(
		private utils: QueryBuilderUtils<DB_HIERARCHY>,
		private readonly _mainTable: RelTableInCode,
	) {}
	private _where: SQL[] = [];
	where(...config: WhereProp<TABLE>) {
		this._where.push(this.utils.buildWhere(config, [this._mainTable]));
		return this;
	}
	toSql(): SQL {
		const bindings: any[] = this._where.flatMap((i) => i.bindings);
		let sql = `DELETE FROM ${this._mainTable.relName} AS \`${this._mainTable.name}\``;
		if (this._where.length > 0) {
			sql += ` WHERE ${this._where.map((i) => i.sql).join(" AND ")}`;
		}
		return { sql, bindings };
	}
}
