export interface IRender {
	renderToString?(prop: any): string | Promise<string>;
	///
}
