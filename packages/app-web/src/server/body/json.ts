import { ParamType } from "@thestarweb/star-framework-param-helper";
import { mergeUint8Array, ReaderHelper } from "./helper.js";
import { bodyParse } from "./types.js";

const charCodeQuote = '"'.charCodeAt(0);
const charCodeOpenCornerBracket = "[".charCodeAt(0);
const charCodeCloseCornerBracket = "]".charCodeAt(0);
const charCodeOpenCurlyBracket = "{".charCodeAt(0);
const charCodeCloseCurlyBracket = "}".charCodeAt(0);
const charCodeReverseSlash = "\\".charCodeAt(0);
const charCodeTab = "\t".charCodeAt(0);
const charCodeReturn = "\r".charCodeAt(0);
const charCodeNewLine = "\n".charCodeAt(0);
const charCodeSpace = " ".charCodeAt(0);
const charCodesSkip = [
	charCodeTab,
	charCodeReturn,
	charCodeNewLine,
	charCodeSpace,
];
const charCodeR = "r".charCodeAt(0);
const charCodeN = "n".charCodeAt(0);
const charCodeT = "t".charCodeAt(0);
const charCodeU = "u".charCodeAt(0);
const charCodeF = "f".charCodeAt(0);
const charCode0 = "0".charCodeAt(0);
const charCode9 = "9".charCodeAt(0);
const charCodeDot = ".".charCodeAt(0);
const charCodeComma = ",".charCodeAt(0);
const charCodeColon = ":".charCodeAt(0);
const decoder = new TextDecoder();

let defAny: ParamType = { type: "any" };
export const JSONBody: bodyParse = (headrer, targetType) => {
	if (headrer["content-type"]?.startsWith("application/json")) {
		return (stream) => {
			const helper = new ReaderHelper(stream);
			function charError(char: number, expectation?: string[]) {
				throw new Error(
					`unexpectation ${String.fromCharCode(char)}(char code ${char})${expectation ? `, expectation ${expectation.join(",")}` : ""}, at ${helper.totalIndex}`,
				);
			}
			async function match(head: string, find: string) {
				const dataString = await helper.readAsString(find.length, decoder);
				if (dataString !== find) {
					throw new Error(
						`unexpectation ${head}${dataString}, expectation ${head}${find})}, at ${helper.totalIndex}`,
					);
				}
			}
			async function readString() {
				const strings: string[] = [];
				let loop = true;
				while (loop) {
					await helper.streamReadUntil((buff) => {
						for (var i = 0; i < buff.length; i++) {
							const item = buff[i];
							if (item == charCodeQuote) {
								strings.push(
									decoder.decode(buff.subarray(0, i), { stream: true }),
								);
								loop = false;
								return i + 1;
							}
							if (item === charCodeReverseSlash) {
								strings.push(
									decoder.decode(buff.subarray(0, i), { stream: true }),
								);
								return i + 1;
							}
						}
						strings.push(decoder.decode(buff, { stream: true }));
						return -1;
					});
					if (loop) {
						const char = await helper.readChar();
						switch (char) {
							case charCodeReverseSlash:
								strings.push("\\");
								break;

							case charCodeT:
								strings.push("\t");
								break;
							case charCodeR:
								strings.push("\r");
								break;
							case charCodeN:
								strings.push("\n");
								break;

							case charCodeU:
								// t = charCodeReturn;
								throw new Error("暂时不支持\\u编码");
								break;
							default:
								charError(char, ["r", "n", "t", "\\"]);
						}
					}
				}
				return strings.join("");
			}
			async function readArray(targetType: ParamType, path: string[]) {
				let t: ParamType | ParamType[] = defAny;
				if (targetType.type == "array") {
					t = targetType.items;
				}
				const res = [];

				await helper.skipChar(charCodesSkip);
				if ((await helper.viewChar()) === charCodeCloseCornerBracket) {
					await helper.readChar();
					return [];
				}
				while (true) {
					const ret = await start(Array.isArray(t) ? t[res.length] : t, [
						...path,
						`${res.length}`,
					]);
					res.push(ret);
					await helper.skipChar(charCodesSkip);
					const nextChar = await helper.readChar();
					if (nextChar === charCodeCloseCornerBracket) {
						return res;
					}
					if (nextChar != charCodeComma) {
						charError(nextChar, [",", "]"]);
					}
				}
			}
			async function readObject(targetType: ParamType, path: string[]) {
				const obj: any = {};
				let needComma = false;
				while (true) {
					await helper.skipChar(charCodesSkip);
					const char = await helper.readChar();
					if (char == charCodeCloseCurlyBracket) {
						return obj;
					}
					if (needComma) {
						if (char === charCodeComma) {
							needComma = false;
						} else {
							charError(char, [",", "}"]);
						}
					} else {
						if (char === charCodeQuote) {
							const key = await readString();
							await helper.skipChar(charCodesSkip);

							const char = await helper.readChar();
							if (char !== charCodeColon) charError(char, [":"]);
							obj[key] = await start(defAny, [...path, key]);
							needComma = true;
						} else {
							charError(char, ['"', "}"]);
						}
					}
				}
			}
			async function start(
				targetType: ParamType,
				path: string[] = [],
				endFlag?: number,
			): Promise<any> {
				await helper.skipChar(charCodesSkip);
				const char = await helper.readChar();
				switch (char) {
					case charCodeQuote:
						return await readString();
					case charCodeOpenCornerBracket:
						return await readArray(targetType, path);
					case charCodeOpenCurlyBracket:
						return await readObject(targetType, path);

					case charCodeN: {
						await match("n", "ull");
						return null;
					}
					case charCodeT:
						await match("t", "rue");
						return true;
					case charCodeF:
						await match("f", "alse");
						return false;
					default:
						if (char >= charCode0 && char <= charCode9) {
							const text = [String.fromCharCode(char)];
							const hasDot = false;
							await helper.streamReadUntil((arr) => {
								for (let i = 0; i < arr.length; i++) {
									const item = arr[i];
									if (item >= charCode0 && item <= charCode9) {
										continue;
									}
									if (arr[i] === charCodeDot && !hasDot) {
										continue;
									}
									text.push(decoder.decode(arr.subarray(0, i)));
									return i;
								}
								text.push(decoder.decode(arr));
								return -1;
							}, false);
							return parseFloat(text.join(""));
						}
						charError(char, ["{", "[", '"', "null", "true", "false", "number"]);
				}
			}
			return start(targetType);
		};
	}
	return null;
};
