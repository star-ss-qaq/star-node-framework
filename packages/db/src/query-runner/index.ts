import { SQL } from "../query-build/types.js";
import { InDBTableSchema } from "../types/schema.js";

const checkKeys = [
	"queryData",
	"exec",
	"showTables",
	"getDBTableSchema",
] as const;
export abstract class QueryRunner {
	constructor() {
		checkKeys.forEach((key) => {
			const raw: any = this[key];
			this[key] = function (this: QueryRunner, ...prop: any[]) {
				if (this._isDestroyed) throw new Error("this QueryRunner is destroyed");
				return raw.apply(this, prop);
			} as any;
		});
	}
	public abstract queryData(sql: SQL): Promise<any[]>;
	public abstract exec(
		sql: SQL,
	): Promise<{ changed: number; lastInsertRowid: any }>;

	public abstract showDatabases(): string[];
	public abstract showTables(db: string): string[] | Promise<string[]>;
	public abstract getDBTableSchema(
		name: string,
		db: string,
	): InDBTableSchema | Promise<InDBTableSchema>;

	protected abstract _destroy(): void | Promise<void>;
	private _isDestroyed = false;
	destroy() {
		this._isDestroyed = true;
		this._destroy();
	}
	[Symbol.dispose]() {
		this.destroy();
	}
}
