import { ScopeHelper } from "@thestarweb/ts-helper";
import {
	CallExpression,
	Expression,
	KeywordTypeNode,
	NewExpression,
	Node,
	NodeFactory,
	SyntaxKind,
	Type,
	TypeNode,
	TypeReference,
	TypeReferenceNode,
} from "typescript";

export type FromArg<T> = { arg: number | [number, number]; default?: T };
export type FromArgWithSelf<T> = T | FromArg<T>;

export type MethodRemoveOption =
	| "all"
	| { prop?: boolean; body?: boolean | "throw"; returnType?: boolean };

interface DecoratorHandle {
	/**
	 * @default false
	 */
	alwaysRemoveSelf?: FromArgWithSelf<boolean>;
	/**
	 * @default true
	 */
	enable?: boolean;
}
interface ClassDecoratorHandle extends DecoratorHandle {}
interface PropertyDecoratorHandle extends DecoratorHandle {}
interface MethodDecoratorHandle extends DecoratorHandle {
	removeMode?: FromArgWithSelf<MethodRemoveOption>;
}
type CustomizeHandle<T, R = T> = (
	node: T,
	currentSide: StarFrameworkSide[],
	factory: NodeFactory,
) => R | undefined | [];

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
	 * 作为修饰时需要做啥,如果声明了特定修饰器的工作那么以特定模式为准
	 */
	whenDecorator?: DecoratorHandle;
	whenClassDecorator?: ClassDecoratorHandle;
	whenPropertyDeclaration?: PropertyDecoratorHandle;
	whenMethodDeclaration?: MethodDecoratorHandle;
	whenCallExpression?: {
		/**
		 * replace模式暂未实装，请勿使用
		 */
		mode: FromArgWithSelf<"remove" | "replace" | "customize">;
		/**
		 * replace模式下必须
		 */
		replaceProp?: FromArgWithSelf<{
			import: string;
			name: string;
		}>;
		/**
		 * customize模式下必须
		 */
		customizeHandle?: CustomizeHandle<CallExpression, Expression>;
	};
	// whenNewExpression?: {
	// 	mode: FromArgWithSelf<"remove" | "replace" | "customize">;
	// 	replaceProp?: FromArgWithSelf<{
	// 		import: string;
	// 		name: string;
	// 	}>;
	// 	customizeHandle?: CustomizeHandle<CallExpression, Expression>;
	// };
	whenTypeReferenceNode?: {
		mode: FromArgWithSelf<"customize">;
		/**
		 * customize模式下必须
		 */
		customizeHandle?: CustomizeHandle<
			TypeReferenceNode,
			| TypeReferenceNode
			| TypeNode
			| KeywordTypeNode<SyntaxKind.NeverKeyword | SyntaxKind.AnyKeyword>
			| KeywordTypeNode<SyntaxKind.NeverKeyword | SyntaxKind.AnyKeyword>
		>;
	};
	/**
	 * 规则优先级
	 * 当多个修饰器规则同时作用于一个目标时有效
	 */
	importent?: number;
	call?: { replase: { import: string; name: string } };
}
export interface SiteOnlyConfig {
	rules?: SiteOnlyConfigRule[];
}
export type TypeVisitor<T extends Node> = (
	currentSide: StarFrameworkSide[],
	node: T,
	factory: NodeFactory,
	scope: ScopeHelper,
) => Node | Node[];
