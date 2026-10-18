import {
	AllColumn,
	AllColumnNoWildcard,
	AllColumnWithAlias,
	ParseFieldInfo,
} from "../types/helpers/column.js";
import { ColumnSchema, InstanceSchema } from "../types/schema.js";
import {
	AnyTableInput,
	ResolveAnyTableInfoWithAlias,
	SQL,
	TableFieldsAndName,
	TableInfoInCode,
	UnionToIntersection,
} from "./types.js";
import { QueryBuilderUtils } from "./utils/index.js";
import { WhereProp } from "./utils/where.js";

export type ResolveSelectQueryRes<T extends Record<string, any>> = T;

type TableInfo = Record<
	string,
	{ fieldsTypes: Record<string, any>; path?: string }
>;
// abstract class WhereSqlBuild<K extends string> {
// 	where(col: K) {
// 		return this;
// 	}
// }
type JoinTableConfig = TableInfoInCode & { joinMode: string; on: SQL[] };
interface ColInfo {
	select: string;
	colSchema?: ColumnSchema;
}
export class SelectQueryBuild<
	S extends InstanceSchema,
	TABLES extends TableInfo,
	RES extends Record<string, any> = {},
> {
	private _tableCol: Record<string, Record<string, ColInfo>> =
		Object.create(null);

	private _getTableColMeta(tableInfo: TableInfoInCode) {
		if (tableInfo.isQuery) {
			return Object.fromEntries(
				Object.entries(tableInfo.query._columns).map(([col, v]) => {
					return [
						col,
						{
							...v,
							select: `\`${tableInfo.name}\`.\`${col}\``,
						},
					];
				}),
			);
		}
		return Object.fromEntries(
			Object.entries(tableInfo.tableSchema.columns).map(([col, v]) => {
				return [
					col,
					{
						select: `\`${tableInfo.name}\`.\`${v.name || this.utils.formatName(col)}\``,
						colSchema: v,
					},
				];
			}),
		);
	}
	constructor(
		private utils: QueryBuilderUtils,
		private readonly _mainTable: TableInfoInCode,
	) {
		this._tableCol[_mainTable.name] = this._getTableColMeta(_mainTable);
	}
	private _columns: Record<string, ColInfo> = Object.create(null);
	get selectedColumns() {
		return Object.keys(this._columns);
	}
	addSelect<TT extends AllColumnWithAlias<TABLES>[]>(
		...fields: TT
	): SelectQueryBuild<
		S,
		TABLES,
		RES & UnionToIntersection<ParseFieldInfo<TABLES, TT[number]>>
	> {
		const addTableCol = (tableAlias: string) => {
			Object.assign(this._columns, this._tableCol[tableAlias]);
		};
		fields.forEach((f) => {
			if (f === "*") {
				Object.keys(this._tableCol).forEach(addTableCol);
			} else if (f.endsWith(".*")) {
				addTableCol(f.substring(0, f.length - 2));
			} else {
				let [ff, alias] = f.split(" as ");
				let [table, col] = ff.split(".");
				let colInfo: ColInfo | undefined;
				if (col) {
					colInfo = this._tableCol[table]?.[col];
				} else {
					col = table;
					const eTables = Object.keys(this._tableCol).filter(
						(i) => col in this._tableCol[i],
					);
					if (eTables.length > 1) {
						throw new Error(
							`there is more than one table(${eTables.join(",")}) has column ${col}`,
						);
					}
					if (eTables.length === 1) {
						colInfo = this._tableCol[eTables[0]][col];
					}
				}
				if (!colInfo) {
					throw new Error(`unknown column ${ff}`);
				}
				if (!alias) alias = col;
				if (alias in this._columns) {
					throw new Error(`duplicate column name ${alias}`);
				}
				this._columns[alias] = colInfo;
			}
		});
		return this as any;
	}
	cleanSelect() {
		this._columns = {};
		return this as SelectQueryBuild<S, TABLES, {}>;
	}
	private _selectWithFn<TT extends AllColumn<TABLES>, A extends string>(
		fn: string,
		col: TT,
		a: A,
	) {
		this._columns[a] = { select: `${fn}(${col})` };
		return this as SelectQueryBuild<S, TABLES, RES & { [k in A]: number }>;
	}
	count<TT extends AllColumn<TABLES>, A extends string>(col: TT, a: A) {
		return this._selectWithFn("COUNT", col, a);
	}

	getTableInfoAndNames(outName = true): TableFieldsAndName {
		return Object.fromEntries(
			Object.entries(this._columns).map(([k, v]) => [
				k,
				{ relName: outName ? `\`${k}\`` : v.select, columnSchema: v.colSchema },
			]),
		);
	}
	private _where: SQL[] = [];
	where(...config: WhereProp<TABLES, RES>) {
		this._where.push(
			this.utils.buildWhere(
				config,
				[this._mainTable, ...this._joinTable],
				this.getTableInfoAndNames(false),
			),
		);
		return this;
	}
	private _lastJoinTable: JoinTableConfig | null = null;
	private _joinTable: JoinTableConfig[] = [];
	join<N extends AnyTableInput<S>>(table: N, joinMode?: "left") {
		const info = this.utils.resolveTable(table);
		if (info.name in this._tableCol) {
			throw new Error(`duplicate table name ${info.name}`);
		}
		this._lastJoinTable = {
			...info,
			joinMode: joinMode ? `${joinMode.toLocaleUpperCase()} JOIN` : "JOIN",
			on: [],
		};
		this._joinTable.push(this._lastJoinTable);
		this._tableCol[info.name] = this._getTableColMeta(info);
		return this as SelectQueryBuild<
			S,
			TABLES & ResolveAnyTableInfoWithAlias<S, N>,
			RES
		>;
	}
	on(...config: WhereProp<TABLES, RES, true>) {
		if (!this._lastJoinTable) throw new Error("");
		this._lastJoinTable.on.push(
			this.utils.buildWhere(
				config,
				[this._mainTable, ...this._joinTable],
				this.getTableInfoAndNames(),
				true,
			),
		);
		return this;
	}
	// where<C extends AllColumnNoWildcard<TABLES>>(
	// 	col: C,
	// 	op: ">" | "<" | "=" | "!=" | ">=" | "<=",
	// 	value: any,
	// ): this;
	// where<C extends AllColumnNoWildcard<TABLES>>(
	// 	col: C,
	// 	op: "in",
	// 	value: any[],
	// ): this;
	// where<C extends AllColumnNoWildcard<TABLES>>(
	// 	col: C,
	// 	op: "is null" | "is not null",
	// ): this;
	// where<C extends AllColumnNoWildcard<TABLES>>(
	// 	col: C,
	// 	op: string,
	// 	value?: any,
	// ) {
	// 	return this;
	// }
	// where = createWhereHandle(() => this);

	private _groupBy: string[] = [];
	groupBy<TT extends AllColumnNoWildcard<TABLES> | keyof RES>(col: TT) {
		if (col in this._columns && this._columns[col as string].colSchema) {
			this._groupBy.push(this._columns[col as string].select);
		} else {
			this._groupBy.push(col as string);
		}
		return this;
	}

	private _orderBy: { col: string; order: "ASC" | "DESC" }[] = [];
	orderBy<TT extends AllColumnNoWildcard<TABLES> | keyof RES>(
		col: TT,
		order: "ASC" | "DESC" = "DESC",
	) {
		if (col in this._columns && this._columns[col as string].colSchema) {
			this._orderBy.push({ col: this._columns[col as string].select, order });
		} else {
			this._orderBy.push({ col: col as string, order });
		}
		return this;
	}

	private _limit = -1;
	limit(limit: number) {
		this._limit = limit;
		return this;
	}
	private _offset = 0;
	offset(offset: number) {
		this._offset = offset;
		return this;
	}

	asSubQuery<Name extends string>(name: Name) {
		return [this, name] as const;
	}

	toSql(): SQL {
		const sqls: (string | number)[] = [
			"SELECT",
			Object.keys(this._columns).length > 0
				? Object.entries(this._columns)
						.map(([name, config]) => `${config.select} AS \`${name}\``)
						.join(", ")
				: "*",
			"FROM",
		];
		const bindings: any[] = [];
		const mainTable = this.utils.tableInfoToSql(this._mainTable);
		sqls.push(mainTable.sql);
		bindings.push(...mainTable.bindings);

		this._joinTable.forEach((t) => {
			const table = this.utils.tableInfoToSql(t);
			sqls.push(t.joinMode.toUpperCase(), table.sql);
			bindings.push(...table.bindings);
			sqls.push("ON", t.on.map((o) => o.sql).join(" AND "));
			bindings.push(...t.on.flatMap((o) => o.bindings));
		});

		if (this._where.length > 0) {
			sqls.push("WHERE", this._where.map((i) => i.sql).join(" AND "));
			bindings.push(...this._where.flatMap((i) => i.bindings));
		}

		if (this._groupBy.length > 0) {
			sqls.push("GROUP BY", this._groupBy.join(", "));
		}
		if (this._orderBy.length > 0) {
			sqls.push(
				"ORDER BY",
				this._orderBy.map((i) => `${i.col} ${i.order}`).join(", "),
			);
		}

		if (this._limit > 0) sqls.push("LIMIT", this._limit);
		if (this._offset > 0) sqls.push("LIMIT", this._offset);

		return {
			sql: sqls.join(" "),
			bindings,
		};
	}

	then(callback: (res: RES[]) => any) {
		this.utils.queryRunner.queryData(this.toSql()).then((res) => {
			callback(
				res.map(
					(i) =>
						Object.fromEntries(
							Object.entries(i).map(([k, v]) => [
								k,
								this._columns[k]?.colSchema
									? this.utils.handleDbValueToCode(
											this._columns[k].colSchema,
											v,
										)
									: v,
							]),
						) as RES,
				),
			);
		});
	}
	async one(): Promise<ResolveSelectQueryRes<RES>> {
		const res = await this;
		return res[0];
	}
	async page(page: number, pageSize: number) {
		const [{ total } = { total: 0 }, data] = await Promise.all([
			this.fork().cleanSelect().count("*", "total").one(),
			this.fork()
				.limit(pageSize)
				.offset((page - 1) * pageSize),
		]);
		return { total, data };
	}
	fork() {
		const newObj = Object.assign(
			Object.create(Object.getPrototypeOf(this)),
			this,
			{
				_tableCol: { ...this._tableCol },
				_columns: { ...this._columns },
				_joinTable: [...this._joinTable],
				_where: [...this._where],
				_groupBy: [...this._groupBy],
				_orderBy: [...this._orderBy],
			},
		) as this;
		if (newObj._lastJoinTable) {
			newObj._lastJoinTable = {
				...newObj._lastJoinTable,
				on: [...newObj._lastJoinTable.on],
			};
			newObj._joinTable.pop();
			newObj._joinTable.push(newObj._lastJoinTable);
		}
		return newObj;
	}
}
