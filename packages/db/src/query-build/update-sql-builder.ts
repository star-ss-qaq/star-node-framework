import { StringKeyOf } from "@thestarweb/ts-helper";
import { RelTableInfo } from "../types/helpers/table.js";
import { InstanceSchema } from "../types/schema.js";
import { RelTableInCode, SQL } from "./types.js";
import { QueryBuilderUtils } from "./utils/index.js";
import { WhereProp } from "./utils/where.js";
import { DBExecResult } from "../types/index.js";

export class UpdateQueryBuild<
	S extends InstanceSchema,
	TABLE extends Record<string, RelTableInfo<any, any, any>>,
	FIllED_KEYS extends string = never,
> {
	constructor(
		private utils: QueryBuilderUtils<any>,
		private readonly _mainTable: RelTableInCode,
	) {}
	private _value: Record<string, any> = Object.create(null);
	set<T extends Omit<Partial<TABLE[keyof TABLE]["fieldsTypes"]>, FIllED_KEYS>>(
		value: T,
	): UpdateQueryBuild<S, TABLE, FIllED_KEYS | StringKeyOf<T>>;
	set<
		T extends Exclude<
			StringKeyOf<TABLE[keyof TABLE]["fieldsTypes"]>,
			FIllED_KEYS
		>,
	>(key: T, value: any): UpdateQueryBuild<S, TABLE, FIllED_KEYS | T>;
	set(prop1: any, prop2?: any) {
		if (typeof prop1 === "string") {
			this._value[prop1] = prop2;
		} else {
			Object.entries(prop1).forEach(([k, v]) => {
				this._value[k] = v;
			});
		}
		return this;
	}

	private _where: SQL[] = [];
	where(...config: WhereProp<TABLE>) {
		this._where.push(this.utils.buildWhere(config, [this._mainTable]));
		return this;
	}
	toSql(): SQL {
		const {
			tableSchema: { columns },
			relName,
			name,
		} = this._mainTable;
		const bindings: any[] = [];
		let sql = `UPDATE ${relName} AS ${name} ${Object.entries(this._value)
			.map(([k, v]) => {
				bindings.push(v);
				return `\`${columns[k].name || this.utils.formatName(k)}\` = ?`;
			})
			.join(", ")}`;
		if (this._where.length > 0) {
			sql += ` WHERE ${this._where.map((i) => i.sql).join(" AND ")}`;
			bindings.push(...this._where.flatMap((i) => i.bindings));
		}
		return { sql, bindings };
	}
	then(callback: (res: DBExecResult[]) => any) {
		this.utils.commonUtils.exec(this.toSql()).then((res) => callback);
	}
}
