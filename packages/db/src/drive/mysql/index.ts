import { QueryRunner } from "../../query-runner/index.js";
import {
	defaultDBDifferenceApply,
	defaultDBDifferenceToSql,
} from "../../structure/struct-update-sql-build.js";
import { DBDifference } from "../../types/schema.js";
import { IDrive } from "../i-drive.js";
import { MysqlQueryRunner } from "./query-runner.js";
import {
	createPool,
	createConnection,
	PoolOptions,
	Pool,
} from "mysql2/promise";
import { StructUpdateHelper } from "./struct-update-helper.js";

export class MysqlDrive implements IDrive {
	noDbHierarchy = false as const;
	private pool?: Pool;
	private connection: string | PoolOptions;
	constructor({
		usePool = true,
		connection,
	}: {
		/**
		 * 是否使用连接池
		 * @default true
		 */
		usePool?: boolean;
		connection: string | PoolOptions;
	}) {
		this.connection = connection;
		if (usePool) {
			this.pool = createPool(connection as any);
		}
	}

	async createQueryRunner() {
		const connection = await (this.pool
			? this.pool.getConnection()
			: createConnection(this.connection as any));
		return new MysqlQueryRunner(connection);
	}
	async applyChange(queryRunner: QueryRunner, schema: DBDifference[]) {
		return await defaultDBDifferenceApply(
			schema,
			(sql) => queryRunner.exec({ sql, bindings: [] }),
			StructUpdateHelper,
		);
	}
	getUpdateSql(schema: DBDifference[]): string {
		return defaultDBDifferenceToSql(schema, StructUpdateHelper);
	}
	tableTypeConvertor = {
		default: "InnoDB",
		mem: "Memory",
	};
}
