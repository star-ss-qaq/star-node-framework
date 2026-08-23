export interface ServerInstanceConfig {
	main: object;
	if?: (url: URL) => boolean;
	importent?: number;
}
export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}
