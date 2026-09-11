export type FromArg<T> = { arg: number | [number, number] };
export type FromArgWithSelf<T> = T | FromArg<T>;
export type MethodRemoveMode = "delete" | "throw";
export interface SiteOnlyConfigRule {
	/**
	 * 从哪导入
	 */
	import: string | string[];
	/**
	 * 导出的变量名
	 */
	name: string | string[];
	/**
	 * 规则描述的在哪个环境生效
	 */
	side: FromArgWithSelf<StarFrameworkSide | StarFrameworkSide[]>;
	/**
	 * 生效时表示保留还是移除
	 * @default exclude
	 */
	type?: "include" | "exclude";
	/**
	 * 移除的方式
	 * - delete 删除修饰的方法
	 * - throw 保留定义，但是目前实际使用还是有些差异，不建议使用，需要之后再做规范
	 * @default delete
	 */
	mode?: FromArgWithSelf<MethodRemoveMode>;
	/**
	 * 规则优先级
	 * 当多个修饰器规则同时作用于一个目标时有效
	 */
	importent?: number;
	/**
	 * 色否移除修饰器本身，这个也需要再确认使用场景
	 * @default false
	 */
	removeSelf?: boolean;
}
export interface SiteOnlyConfig {
	rules?: SiteOnlyConfigRule[];
}
