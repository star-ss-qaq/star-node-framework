import { IDrive } from "./i-drive.js";
import { MysqlDrive } from "./mysql/index.js";
import { SQLiteOnlyDrive } from "./sqlite/index.js";
import { TestOnlyDrive } from "./test-only.js";

export const RegisteredDriveMap = {
	sqlite: SQLiteOnlyDrive,
	mysql: MysqlDrive,
	"test-only": TestOnlyDrive,
} satisfies {
	[k in string]: new (config: any) => IDrive<any>;
};
