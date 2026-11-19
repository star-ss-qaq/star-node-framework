import { IDrive } from "./i-drive.js";
export const RegisteredDriveMap = {
	sqlite: () => import("./sqlite/index.js").then((m) => m.SQLiteOnlyDrive),
	mysql: () => import("./mysql/index.js").then((m) => m.MysqlDrive),
	"test-only": () => import("./test-only.js").then((m) => m.TestOnlyDrive),
} satisfies {
	[k in string]: () => Promise<new (config: any) => IDrive<any>>;
};
