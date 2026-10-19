import { IDrive } from "./i-drive.js";
import { SQLiteOnlyDrive } from "./sqlite/index.js";
import { TestOnlyDrive } from "./test-only.js";

export const RegisteredDriveMap = {
	sqlite: SQLiteOnlyDrive,
	"test-only": TestOnlyDrive,
} satisfies {
	[k in string]: new (config: any) => IDrive<any>;
};
