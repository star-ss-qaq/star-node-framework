import { SQL } from "../query-build/types.js";

export abstract class QueryRunner {
	abstract _queryData(sql: SQL): Promise<any[]>;
	queryData(sql: SQL) {
		if (this._isDestroyed) throw new Error("this QueryRunner is destroyed");
		return this._queryData(sql);
	}
	abstract _exec(sql: SQL): Promise<{ changed: number; lastInsertRowid: any }>;
	exec(sql: SQL) {
		if (this._isDestroyed) throw new Error("this QueryRunner is destroyed");
		return this._exec(sql);
	}
	protected abstract _destroy(): void | Promise<void>;
	private _isDestroyed = false;
	destroy() {
		this._isDestroyed = true;
		this._destroy();
	}
}
