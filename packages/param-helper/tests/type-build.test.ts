import { expect, describe, test } from "vitest";
import { buildType, ParamTypeEnum } from "../src/index.js";

describe("测试类型校验与自动转换", () => {
	test("最基础的验证", async () => {
		expect(
			() => buildType({ type: ParamTypeEnum.Number }, "anc"),
			"不能将字符串转换成数字",
		).toThrow();
		expect(
			() => buildType({ type: ParamTypeEnum.Int }, 1.1),
			"不能将浮点转换成整数",
		).toThrow();
		expect(
			() => buildType({ type: ParamTypeEnum.Enum, values: ["123"] }, "anc"),
			"不能将枚举之外的内容转换给枚举",
		).toThrow();
		expect(
			buildType({ type: ParamTypeEnum.Enum, values: ["123"] }, "123"),
			"枚举包含的类型应该可以通过验证",
		).toBe("123");
	});
	test("默认支持字符串转换", async () => {
		expect(
			buildType({ type: ParamTypeEnum.Number }, "123.1"),
			"数字类型可以转换",
		).toBe(123.1);
		expect(
			buildType({ type: ParamTypeEnum.Number }, "123"),
			"整数类型可以转换",
		).toBe(123);
	});
	test("对象的验证", async () => {
		expect(
			buildType(
				{ type: ParamTypeEnum.Object, properties: {}, required: [] },
				{},
			),
			"妈妈组条件的对象应该能正常转换",
		).toEqual({});
		expect(
			buildType(
				{ type: ParamTypeEnum.Object, properties: {}, required: [] },
				{ a: "" },
			),
			"多余字段需要抛弃",
		).toEqual({});
		expect(
			() =>
				buildType(
					{
						type: ParamTypeEnum.Object,
						properties: { a: { type: ParamTypeEnum.Number } },
						required: [],
					},
					{ a: "" },
				),
			"字段类型错误需要报错",
		).toThrow();
		expect(
			() =>
				buildType(
					{
						type: ParamTypeEnum.Object,
						properties: {
							a: { type: ParamTypeEnum.String },
							b: { type: ParamTypeEnum.Number },
						},
						required: ["b"],
					},
					{ a: "" },
				),
			"缺少字段需要报错",
		).toThrow();
	});
	test("组合类型的验证", async () => {
		expect(
			buildType(
				{
					type: ParamTypeEnum.AnyOf,
					anyOf: [
						{ type: ParamTypeEnum.Number },
						{ type: ParamTypeEnum.Boolean },
					],
				},
				"123.1",
			),
			"数字类型可以转换",
		).toBe(123.1);
		expect(
			buildType(
				{
					type: ParamTypeEnum.AnyOf,
					anyOf: [
						{ type: ParamTypeEnum.Number },
						{ type: ParamTypeEnum.Boolean },
					],
				},
				true,
			),
			"同时也要能支持布尔类型",
		).toBe(true);
		expect(
			() =>
				buildType(
					{
						type: ParamTypeEnum.AnyOf,
						anyOf: [
							{ type: ParamTypeEnum.Number },
							{ type: ParamTypeEnum.Boolean },
						],
					},
					"",
				),
			"如果不满足任何一个，要抛出异常",
		).toThrow();
		expect(
			buildType(
				{
					type: ParamTypeEnum.AnyOf,
					anyOf: [
						{
							type: ParamTypeEnum.Object,
							properties: { a: { type: ParamTypeEnum.String } },
							required: ["a"],
						},
						{
							type: ParamTypeEnum.Object,
							properties: { b: { type: ParamTypeEnum.String } },
							required: ["b"],
						},
					],
				},
				{ b: "" },
			),
			"对于对象这种复杂场景也需要能支持",
		).toEqual({ b: "" });
	});
	test("需要支持map", async () => {
		const map: Map<string, any> = buildType(
			{
				type: ParamTypeEnum.Object,
				properties: {},
				required: [],
				additionalProperties: { type: ParamTypeEnum.String },
				matchType: Map,
			},
			{ a: "1", b: "2" },
		);
		expect(map, "应该返回map类型").toBeInstanceOf(Map);
		expect(map.size, "map的大小应该和传入的数据一致").toBe(2);
		expect(map.get("a"), "应该从map中正确的拿到值").toBe("1");
		expect(
			() =>
				buildType(
					{
						type: ParamTypeEnum.Object,
						properties: {},
						required: [],
						additionalProperties: { type: ParamTypeEnum.String },
						matchType: Map,
					},
					{ a: 1 },
				),
			"map类型不匹配应该抛出异常",
		).toThrow();
	});
});
