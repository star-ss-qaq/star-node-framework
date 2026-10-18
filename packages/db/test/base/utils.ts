import { expect } from "vitest";
import { SQL } from "../../src/sql-build/types.js";

export function checkSql(
	sql: SQL,
	textSql: string,
	bindings: any[] = [],
	message?: string,
) {
	expect(sql, message).toEqual({
		sql: textSql.replace(/[\r\n ]+/g, " "),
		bindings,
	});
}
