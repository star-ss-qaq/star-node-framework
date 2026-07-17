import { MethodRemoveMode } from "./types.js";

declare global {
	interface StarFrameworkSideConfig {}
	type StarFrameworkSide = keyof StarFrameworkSideConfig;
	type StarFrameworkSideSwith = StarFrameworkSide | StarFrameworkSide[];

	/**
	 * 宏定义：在指定的环境下才保留这个类型，其余环境替换为undefined，避免被运行时类型引入
	 */
	type SFSiteOnly<Side extends StarFrameworkSideSwith, T> = T;
	/**
	 * 宏定义：在指定的环境下替换为undefined，其余环境为正常类型，避免被运行时类型引入
	 */
	type SFSiteOmit<Side extends StarFrameworkSideSwith, T> = T;

	/**
	 * 宏定义：在指定的环境下才保留被修饰的方法
	 */
	function SFSiteOnly(
		side: StarFrameworkSideSwith,
	): MethodDecorator & PropertyDecorator & ClassDecorator;
	function SFSiteOnly(
		side: StarFrameworkSideSwith,
		/**
		 * 对于MethodDecorator，不匹配时时删除还是修改成一个抛出异常的方法
		 * @default delete
		 */
		mode: MethodRemoveMode,
	): MethodDecorator;

	/**
	 * 宏定义：在指定环境下才保留相关修饰器
	 */
	function SFSiteOnly<
		T extends MethodDecorator & PropertyDecorator & ClassDecorator,
	>(
		side: StarFrameworkSideSwith,
		decorator: T,
	): MethodDecorator & PropertyDecorator & ClassDecorator;

	/**
	 * 宏定义：在非指定的环境下才保留被修饰的方法
	 */
	function SFSiteOmit(
		side: StarFrameworkSideSwith,
	): MethodDecorator & PropertyDecorator & ClassDecorator;
	function SFSiteOmit(
		side: StarFrameworkSideSwith,
		/**
		 * 对于MethodDecorator，不匹配时时删除还是修改成一个抛出异常的方法
		 * @default delete
		 */
		mode: "delete" | "throw",
	): MethodDecorator;

	/**
	 * 宏定义：在非指定环境下才保留相关修饰器
	 */
	function SFSiteOmit<
		T extends MethodDecorator & PropertyDecorator & ClassDecorator,
	>(
		side: StarFrameworkSideSwith,
		decorator: T,
	): MethodDecorator & PropertyDecorator & ClassDecorator;

	/**
	 * 宏定义：在指定的环境使用特定分支的值
	 */
	function SFSiteSwith<T extends Partial<Record<StarFrameworkSide, any>>>(
		t: T,
	): T extends Record<StarFrameworkSide, infer R>
		? R
		: T extends Partial<Record<StarFrameworkSide, infer R>>
			? undefined | R
			: never;
	/**
	 * 宏定义：在指定的环境返回指定的类型，便于打包摇树的时候因为一些不必要的class和类型被运行时类型引入
	 */
	type SFSiteSwith<T extends Partial<Record<StarFrameworkSide, any>>> =
		T extends Record<StarFrameworkSide, infer R>
			? R
			: T extends Partial<Record<StarFrameworkSide, infer R>>
				? undefined | R
				: never;
	const __sfCurrentSide: StarFrameworkSide;
}
