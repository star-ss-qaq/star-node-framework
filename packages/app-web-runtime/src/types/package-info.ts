interface PackageInfoV1 {
	"sf-formate": "1";
	name: string;
	version: string;
	buildAt: number;
	server: {
		dir: string;
		main: string;
	};
	browser: {
		dir: string;
	};
}
export type PackageInfo = PackageInfoV1;
