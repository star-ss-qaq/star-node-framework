import { RelTableInfo } from "../types/helpers/table.js";
import { InstanceSchema } from "../types/schema.js";
import { SelectQueryBuild } from "./select-sql-builder.js";
import { RelTableInCode, SQL } from "./types.js";
import { QueryBuilderUtils } from "./utils/index.js";

export class InsertQueryBuild<
	S extends InstanceSchema,
	TABLE extends RelTableInfo<any, any, any>,
> {
	constructor(
		private utils: QueryBuilderUtils,
		private readonly _mainTable: RelTableInCode,
	) {}
	_data: (
		| TABLE["fieldsTypes"]
		| SelectQueryBuild<S, any, TABLE["fieldsTypes"]>
	)[] = [];
	_hasSubQuery = false;
	data(...data: TABLE["fieldsInsertTypes"][]) {
		this._data.push(...data);
		return this;
	}
	dataFromQuery(data: SelectQueryBuild<S, any, TABLE["fieldsTypes"]>) {
		this._data.push(data);
		this._hasSubQuery = true;
		return this;
	}
	toSql(): SQL {
		const {
			tableSchema: { columns },
			relName,
		} = this._mainTable;
		const keys = Object.keys(columns);
		if (this._hasSubQuery) {
			const bindings: any[] = [];
			const values = this._data.map((i: any, index) => {
				if (i instanceof SelectQueryBuild) {
					const subSql = i.toSql();
					bindings.push(...subSql.bindings);
					return `(SELECT ${keys.map((k) => `\`${k}\``).join(", ")} FROM (${subSql.sql}) AS \`t${index}\`)`;
				}
				return `(SELECT ${keys
					.map((k) => {
						if (k in i) {
							bindings.push(this.utils.handleCodeValueToDb(columns[k], i[k]));
							return `? as ${k}`;
						}
						if ("defaultValue" in columns[k]) {
							bindings.push(
								this.utils.handleCodeValueToDb(
									columns[k],
									columns[k].defaultValue,
								),
							);
							return `? as ${k}`;
						}
						return `null as ${k}`;
					})
					.join(", ")})`;
			});
			const sql = `INSERT INTO ${relName}(${keys.map((k) => `\`${columns[k].name || this.utils.formatName(k)}\``).join(", ")}) ${values.join(" UNION ALL ")}`;
			return { sql, bindings };
		} else {
			const bindings: any[] = [];
			const values = this._data.map(
				(i: any) =>
					`(${keys
						.map((k) => {
							if (k in i) {
								bindings.push(this.utils.handleCodeValueToDb(columns[k], i[k]));
								return "?";
							}
							if ("defaultValue" in columns[k]) {
								bindings.push(
									this.utils.handleCodeValueToDb(
										columns[k],
										columns[k].defaultValue,
									),
								);
								return "?";
							}
							return "null";
						})
						.join(", ")})`,
			);
			const sql = `INSERT INTO ${relName}(${keys.map((k) => `\`${columns[k].name || this.utils.formatName(k)}\``).join(", ")}) VALUES${values.join(", ")}`;
			return { sql, bindings };
		}
	}
}
