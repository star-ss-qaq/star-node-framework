import { ColumnSchema } from "../../types/schema.js";
import { TableFieldsAndName, TableInfoInCode } from "../types.js";

export function formatName(name: string) {
	return name
		.replace(/^[A-Z]/, (x) => x.toLowerCase())
		.replaceAll(/[A-Z]/g, (x) => `_${x.toLowerCase()}`);
}

export function getTableFieldsAndName(tableInfo: TableInfoInCode) {
	const ret: TableFieldsAndName = {};
	if (tableInfo.isQuery) {
		tableInfo.query.selectedColumns.forEach((k) => (ret[k] = { relName: k }));
	} else {
		Object.entries(tableInfo.tableSchema.columns).forEach(([key, schema]) => {
			ret[key] = {
				relName: schema?.name || formatName(key),
				columnSchema: schema,
			};
		});
	}
	return ret;
}
