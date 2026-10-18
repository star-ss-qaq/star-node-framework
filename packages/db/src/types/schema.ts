export type ColumnType = "number" | "int" | "string" | "int-datetime";

export interface ColumnSchema {
	name?: string;
	type: ColumnType;
	length?: number;
	defaultValue?: any;
	/**
	 * @default false
	 */
	nullable?: boolean;
}
export interface TableSchema {
	name?: string;
	type?: "default" | "mem";
	columns: {
		[fieldName: string]: ColumnSchema;
	};
}
export interface DBSchema {
	name?: string;
	tables: Record<string, TableSchema>;
}

export interface InstanceSchema {
	database: Record<string, DBSchema>;
	defaultDatabase: string;
}
