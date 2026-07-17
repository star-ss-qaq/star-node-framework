import { expect, describe, test } from "vitest";
import {
	createSourceFile,
	ExpressionStatement,
	ScriptTarget,
	SourceFile,
	visitEachChild,
	Visitor,
} from "typescript";
import { createTransformTool } from "@thestarweb/ts-helper";
import { crreateSideOnlyVisitor } from "../src/ts-compiler/macro/index.js";

describe("测试SideOnly相关功能是否能正常工作", () => {
	const sideOnly = crreateSideOnlyVisitor(
		//@ts-ignore
		["currentSide"],
		{},
	);
	function f(t: string) {
		return t
			.replaceAll("\r", "")
			.replaceAll("\n", "")
			.replaceAll(/(\W)[ \t]+/g, "$1")
			.replaceAll(/[ \t]+(\W)/g, "$1")
			.replaceAll(/[ \t]+/g, " ");
	}
	function check(source: string, res: string) {
		const t = createTransformTool([
			(context) => (node) => {
				const visitor: Visitor = (node) => {
					return visitEachChild(
						// @ts-ignore
						sideOnly(node, context.factory, {}),
						visitor,
						context,
					);
				};
				return visitor(node) as SourceFile;
			},
		]);
		const { code } = t(source);
		expect(f(code)).toBe(res);
	}
	test("SFSiteOnly函数版本", async () => {
		check("const a=SFSiteOnly('currentSide','hello');", "const a='hello';");
		check("const a=SFSiteOnly('outherSide','hello');", "const a=undefined;");

		check(
			"const a=SFSiteOnly(['outherSide','currentSide'],'hello');",
			"const a='hello';",
		);
		check(
			"const a=SFSiteOnly(['notSide','outherSide'],'hello');",
			"const a=undefined;",
		);
	});
	test("SFSiteOnly类型定义版本", async () => {
		check("let a:SFSiteOnly<'currentSide',string>;", "let a:string;");
		check("let a:SFSiteOnly<'outherSide',string>;", "let a:never;");
		check(
			"let a:SFSiteOnly<['currentSide','outherSide'],string>;",
			"let a:string;",
		);
		check("let a:SFSiteOnly<['outherSide','qaq'],string>;", "let a:never;");
	});

	test("SFSiteOmit函数版本", async () => {
		check("const a=SFSiteOmit('currentSide','hello');", "const a=undefined;");
		check("const a=SFSiteOmit('outherSide','hello');", "const a='hello';");

		check(
			"const a=SFSiteOmit(['outherSide','currentSide'],'hello');",
			"const a=undefined;",
		);
		check(
			"const a=SFSiteOmit(['notSide','outherSide'],'hello');",
			"const a='hello';",
		);
	});
	test("SFSiteOmit类型定义版本", async () => {
		check("let a:SFSiteOmit<'currentSide',string>;", "let a:never;");
		check("let a:SFSiteOmit<'outherSide',string>;", "let a:string;");
		check(
			"let a:SFSiteOmit<['currentSide','outherSide'],string>;",
			"let a:never;",
		);
		check("let a:SFSiteOmit<['outherSide','qaq'],string>;", "let a:string;");
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
			"class A{@SFSideOnly('otherSide','throw')a(){}}",
			'class A{a(...prop:any[]){throw new Error("can not call this function in this side!");}}',
		);
	});
	test("属性饰器", async () => {
		check("class A{@SFSideOnly('currentSide')a:string;}", "class A{a:string;}");
		check("class A{@SFSideOnly('otherSide')a:string;}", "class A{}");
	});
});
