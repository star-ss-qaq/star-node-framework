export type FromArg<T> = { arg: number | [number, number] };
export type FromArgWithSelf<T> = T | FromArg<T>;
export type MethodRemoveMode = "delete" | "throw";
export interface SiteOnlyConfigRule {
	import: string;
	name: string;
	side: FromArgWithSelf<StarFrameworkSide | StarFrameworkSide[]>;
	/**
	 * @default delete
	 */
	mode?: FromArgWithSelf<MethodRemoveMode>;
	/**
	 * @default exclude
	 */
	type?: "include" | "exclude";
	importent?: number;
	/**
	 * @default false
	 */
	removeSelf?: boolean;
}
export interface SiteOnlyConfig {
	rules?: SiteOnlyConfigRule[];
}
