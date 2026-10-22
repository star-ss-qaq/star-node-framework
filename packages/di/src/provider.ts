export interface ValueProvider {
	token: any;
	value: any;
}
export interface ClassProvider {
	token: any;
	class: any;
}

export interface FactoryProvider {
	token: any;
	inject?: any[];
	factory: (...prop: any[]) => any;
}

export type Provider =
	| ValueProvider
	| ClassProvider
	| FactoryProvider
	| (new (...prop: any[]) => any)
	| ((...prop: any[]) => any);
