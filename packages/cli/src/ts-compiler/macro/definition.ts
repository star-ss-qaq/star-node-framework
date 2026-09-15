import { MethodRemoveOption } from "./types.js";

declare global {
	interface StarFrameworkSideConfig {}
	type StarFrameworkSide = keyof StarFrameworkSideConfig;
	type StarFrameworkSideSwith = StarFrameworkSide | StarFrameworkSide[];

	/**
	 * 宏定义：在指定的环境下才保留这个类型，其余环境替换为undefined，避免被运行时类型引入
	 */
	type SFSideOnly<Side extends StarFrameworkSideSwith, T> = T;
	/**
	 * 宏定义：在指定的环境下替换为undefined，其余环境为正常类型，避免被运行时类型引入
	 */
	type SFSideOmit<Side extends StarFrameworkSideSwith, T> = T;

	/**
	 * 宏定义：在指定的环境下才保留被修饰的方法
	 */
	function SFSideOnly(
		side: StarFrameworkSideSwith,
	): MethodDecorator & PropertyDecorator & ClassDecorator;
	function SFSideOnly(
		side: StarFrameworkSideSwith,
		/**
		 * 对于MethodDecorator,设置删除的模式
		 * @default 'all'
		 */
		mode: MethodRemoveOption,
	): MethodDecorator;

	/**
	 * 宏定义：在指定环境下才保留相关修饰器
	 */
	function SFSideOnly<
		T extends MethodDecorator & PropertyDecorator & ClassDecorator,
	>(
		side: StarFrameworkSideSwith,
		decorator: T,
	): MethodDecorator & PropertyDecorator & ClassDecorator;

	/**
	 * 宏定义：在非指定的环境下才保留被修饰的方法
	 */
	function SFSideOmit(
		side: StarFrameworkSideSwith,
	): MethodDecorator & PropertyDecorator & ClassDecorator;
	function SFSideOmit(
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
	function SFSideOmit<
		T extends MethodDecorator & PropertyDecorator & ClassDecorator,
	>(
		side: StarFrameworkSideSwith,
		decorator: T,
	): MethodDecorator & PropertyDecorator & ClassDecorator;

	/**
	 * 宏定义：在指定的环境使用特定分支的值
	 */
	function SFSideSwith<T extends Partial<Record<StarFrameworkSide, any>>>(
		t: T,
	): T extends Record<StarFrameworkSide, infer R>
		? R
		: T extends Partial<Record<StarFrameworkSide, infer R>>
			? undefined | R
			: never;
	/**
	 * 宏定义：在指定的环境返回指定的类型，便于打包摇树的时候因为一些不必要的class和类型被运行时类型引入
	 */
	type SFSideSwith<T extends Partial<Record<StarFrameworkSide, any>>> =
		T extends Record<StarFrameworkSide, infer R>
			? R
			: T extends Partial<Record<StarFrameworkSide, infer R>>
				? undefined | R
				: never;
	const __sfCurrentSide: StarFrameworkSide;
}
