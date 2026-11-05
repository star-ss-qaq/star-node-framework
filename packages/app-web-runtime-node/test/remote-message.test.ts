import { expect, test } from "vitest";
import {
	buildMessage,
	DataProp,
} from "../src/remote-call/utile/remote-message/build.js";
import { UInt8Handle } from "../src/remote-call/utile/remote-message/uint8-handle.js";
import { Reader } from "../src/remote-call/utile/remote-message/reader.js";
import { VarUIntHandle } from "../src/remote-call/utile/remote-message/var-uint-handle.js";
import { VarCharHandle } from "../src/remote-call/utile/remote-message/var-char-handle.js";

test("测试消息协议传输通道", async () => {
	function t<T extends readonly DataProp<any>[]>(data: T, message?: string) {
		expect(
			Reader.reader(
				buildMessage(data),
				data.map((i) => i[1]),
			),
			message,
		).toEqual(data.map((i) => i[0]));
	}
	t([[1, UInt8Handle]], "UInt8");
	t([[1, VarUIntHandle]], "VarUInt");
	t([[192, VarUIntHandle]], "VarUInt");
	t([[0x128, VarUIntHandle]], "VarUInt");
	t([["abc", VarCharHandle]], "Text(en)");
	t([["你好", VarCharHandle]], "Text(zh)");
	t(
		[
			[2, UInt8Handle],
			["你好", VarCharHandle],
			["abc", VarCharHandle],
			[977861, VarUIntHandle],
		],
		"mix1",
	);
});
