import { expect, describe, test } from "vitest";
import {
	createSourceFile,
	ExpressionStatement,
	ScriptTarget,
	SourceFile,
	visitEachChild,
	Visitor,
} from "typescript";
import {
	createTransformerFactoryByTsVistor,
	createTransformTool,
} from "@thestarweb/ts-helper";
import { crreateSideOnlyVisitor } from "../src/ts-compiler/macro/index.js";

describe("测试SideOnly相关功能是否能正常工作", () => {
	const sideOnly = crreateSideOnlyVisitor({
		rules: [
			{
				import: "hello",
				name: ["Aa", "default"],
				//@ts-ignore
				side: "currentSide",
				type: "exclude",
				whenDecorator: { enable: true },
				whenCallExpression: { mode: "remove" },
			},
		],
	});
	function f(t: string) {
		return t
			.replaceAll("\r", "")
			.replaceAll("\n", "")
			.replaceAll(/(\W)[ \t]+/g, "$1")
			.replaceAll(/[ \t]+(\W)/g, "$1")
			.replaceAll(/[ \t]+/g, " ");
	}
	function check(source: string, res: string, message?: string) {
		const t = createTransformTool([
			createTransformerFactoryByTsVistor(
				sideOnly(
					//@ts-ignore
					["currentSide"],
				),
			),
		]);
		const { code } = t(source);
		expect(f(code), message).toBe(f(res));
	}
	test("side-only注释版本", async () => {
		check(
			"export const a = 1;\n// @side-only currentSide\nexport const b = 2;",
			"export const a = 1;\n// @side-only currentSide\nexport const b = 2;",
			"side匹配时，不要移除",
		);
		check(
			"export const a = 1;\n// @side-only outherSide\nexport const b = 2;",
			"export const a = 1;",
			"side不匹配时，需要移除",
		);
	});
	test("side-omit注释版本", async () => {
		check(
			"export const a = 1;\n// @side-omit currentSide\nexport const b = 2;",
			"export const a = 1;",
		);
		check(
			"export const a = 1;\n// @side-omit outherSide\nexport const b = 2;",
			"export const a = 1;\n// @side-omit outherSide\nexport const b = 2;",
		);
	});
	test("SFSideOnly函数版本", async () => {
		check("const a=SFSideOnly('currentSide','hello');", "const a='hello';");
		check("const a=SFSideOnly('outherSide','hello');", "const a=undefined;");

		check(
			"const a=SFSideOnly(['outherSide','currentSide'],'hello');",
			"const a='hello';",
		);
		check(
			"const a=SFSideOnly(['notSide','outherSide'],'hello');",
			"const a=undefined;",
		);
	});
	test("SFSideOnly类型定义版本", async () => {
		check("let a:SFSideOnly<'currentSide',string>;", "let a:string;");
		check("let a:SFSideOnly<'outherSide',string>;", "let a:never;");
		check(
			"let a:SFSideOnly<['currentSide','outherSide'],string>;",
			"let a:string;",
		);
		check("let a:SFSideOnly<['outherSide','qaq'],string>;", "let a:never;");
	});

	test("SFSideOmit函数版本", async () => {
		check("const a=SFSideOmit('currentSide','hello');", "const a=undefined;");
		check("const a=SFSideOmit('outherSide','hello');", "const a='hello';");

		check(
			"const a=SFSideOmit(['outherSide','currentSide'],'hello');",
			"const a=undefined;",
		);
		check(
			"const a=SFSideOmit(['notSide','outherSide'],'hello');",
			"const a='hello';",
		);
	});
	test("SFSiteOmit类型定义版本", async () => {
		check("let a:SFSideOmit<'currentSide',string>;", "let a:never;");
		check("let a:SFSideOmit<'outherSide',string>;", "let a:string;");
		check(
			"let a:SFSideOmit<['currentSide','outherSide'],string>;",
			"let a:never;",
		);
		check("let a:SFSideOmit<['outherSide','qaq'],string>;", "let a:string;");
	});

	test("SFSiteSwith函数版本", async () => {
		check("const a=SFSiteSwith({currentSide:'hello'});", "const a='hello';");
		check("const a=SFSiteSwith({outherSide:'hello'});", "const a=undefined;");
		check("const a=SFSiteSwith({'currentSide':'hello'});", "const a='hello';");
		check("const a=SFSiteSwith({'outherSide':'hello'});", "const a=undefined;");
	});
	test("SFSiteSwith类型定义版本", async () => {
		check("let a:SFSiteSwith<{currentSide:string}>;", "let a:string;");
		check("let a:SFSiteSwith<{outherSide:string}>;", "let a:never;");

		check("let a:SFSiteSwith<{'currentSide':string}>;", "let a:string;");
		check("let a:SFSiteSwith<{'outherSide':string}>;", "let a:never;");
	});

	test("class修饰器", async () => {
		check("@SFSideOnly('currentSide')\nclass A{a(){}}", "class A{a(){}}");
		check("@SFSideOnly('otherSide')\nclass A{a(){}}", "class A{}");
		check(
			"@SFSideOnly(['currentSide','otherSide'])\nclass A{a(){}}",
			"class A{a(){}}",
		);
		check("@SFSideOnly(['otherSide','qaq'])\nclass A{a(){}}", "class A{}");
	});
	test("方法饰器", async () => {
		check("class A{@SFSideOnly('currentSide')a(){}}", "class A{a(){}}");
		check("class A{@SFSideOnly('otherSide')a(){}}", "class A{}");
		check(
			"class A{@SFSideOnly('otherSide',{prop:true,body:'throw'})a(){}}",
			'class A{a(...prop:any[]){throw new Error("can not call this function in this side!");}}',
		);
	});
	test("属性饰器", async () => {
		check("class A{@SFSideOnly('currentSide')a:string;}", "class A{a:string;}");
		check("class A{@SFSideOnly('otherSide')a:string;}", "class A{}");
	});
	test("自定义修饰器规则", async () => {
		check(
			"import { Aa } from 'hello';class A{@Aa('currentSide')a:string;}",
			"import { Aa } from 'hello';class A{}",
		);
		check(
			"import AWA from 'hello';class A{@AWA('currentSide')a:string;}",
			"import AWA from 'hello';class A{}",
		);
		check(
			"import { Ba } from 'hello';class A{@Ba()a:string;}",
			"import { Ba } from 'hello';class A{@Ba()a:string;}",
		);
	});
	test("自定义调用规则", async () => {
		undefined;
		check(
			"import { Aa, Bb } from 'hello';const a = Aa();const b=Bb();",
			"import { Aa, Bb } from 'hello';const a = null;const b=Bb();",
		);
		check(
			"import aa from 'hello';import bb from 'hello2';const a = aa();const b=bb();",
			"import aa from 'hello';import bb from 'hello2';const a = null;const b=bb();",
		);
	});
});
