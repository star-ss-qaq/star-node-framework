export interface ServerConfig {
	instances: {
		main: object;
		if?: (url: URL) => boolean;
		importent?: number;
	}[];
	port: number;
}
