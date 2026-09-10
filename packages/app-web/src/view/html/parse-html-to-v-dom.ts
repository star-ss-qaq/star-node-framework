/**
 * 基于txml根据需要进行调整
 */
import { HTMLVElement, HTMLVNode, VNodeType } from "./types.js";

const openBracket = "<";
/**
 * &lt;
 */
const openBracketCC = "<".charCodeAt(0);
const closeBracket = ">";
/**
 * &gt;
 */
const closeBracketCC = ">".charCodeAt(0);
const minusCC = "-".charCodeAt(0);
/**
 * /
 */
const slashCC = "/".charCodeAt(0);
/**
 * ?
 */
const questionMarkCC = "?".charCodeAt(0);
/**
 * !
 */
const exclamationCC = "!".charCodeAt(0);
/**
 * '
 */
const singleQuoteCC = "'".charCodeAt(0);
/**
 * "
 */
const doubleQuoteCC = '"'.charCodeAt(0);
/**
 * =
 */
const equalSignCC = "=".charCodeAt(0);
/**
 * [
 */
const openCornerBracketCC = "[".charCodeAt(0);
/**
 * ]
 */
const closeCornerBracketCC = "]".charCodeAt(0);
/**
 * ?
 */
const questionCC = "?".charCodeAt(0);

const nameSpacer = "\r\n\t>/= ";

const noChildTag = ["script", "style"];

const SelfClosingTags = ["img", "br", "input", "meta", "link", "hr"];

export function parseHtmlToVDom(html: string, { keepWhitespace = false } = {}) {
	var pos = 0;
	function parseChildren(tagName: string) {
		var children: HTMLVNode[] = [];
		while (html[pos]) {
			if (html.charCodeAt(pos) == openBracketCC) {
				// 检查是标签
				if (html.charCodeAt(pos + 1) === slashCC) {
					// 检查是否是关闭标签
					var closeStart = pos + 2;
					pos = html.indexOf(closeBracket, pos);

					var closeTag = html.substring(closeStart, pos);
					if (closeTag.indexOf(tagName) == -1) {
						// 如果不是关闭当前标签则报错
						var parsedText = html.substring(0, pos).split("\n");
						throw new Error(
							"Unexpected close tag\nLine: " +
								(parsedText.length - 1) +
								"\nColumn: " +
								(parsedText[parsedText.length - 1].length + 1) +
								"\nChar: " +
								html[pos],
						);
					}

					if (pos + 1) pos += 1;

					return children;
				} else if (html.charCodeAt(pos + 1) === exclamationCC) {
					if (
						html.charCodeAt(pos + 2) == minusCC &&
						html.charCodeAt(pos + 3) == minusCC
					) {
						// 评论
						const startCommentPos = pos;
						do {
							pos = html.indexOf(closeBracket, pos + 1);
						} while (
							pos !== -1 &&
							!(
								html.charCodeAt(pos) === closeBracketCC &&
								html.charCodeAt(pos - 1) == minusCC &&
								html.charCodeAt(pos - 2) == minusCC &&
								pos != -1
							)
						);
						children.push({
							type: VNodeType.Comment,
							conetnt: html.substring(
								startCommentPos + 4,
								pos === -1 ? undefined : pos - 3,
							),
						});
						if (pos === -1) {
							pos = html.length;
						}
					} else if (
						html.charCodeAt(pos + 2) === openCornerBracketCC &&
						html.charCodeAt(pos + 8) === openCornerBracketCC &&
						html.substring(pos + 3, pos + 8).toLowerCase() === "cdata"
					) {
						// cdata
						var cdataEndIndex = html.indexOf("]]>", pos);
						if (cdataEndIndex == -1) {
							// children.push(html.substring(pos + 9));
							pos = html.length;
						} else {
							// children.push(html.substring(pos + 9, cdataEndIndex));
							pos = cdataEndIndex + 3;
						}
						console.warn("cdata is not support now, it will be ignore.");
						continue;
					} else {
						// doctype
						const startDoctype = pos;
						pos += 2;
						var encapsuled = false;
						while (
							(html.charCodeAt(pos) !== closeBracketCC ||
								encapsuled === true) &&
							html[pos]
						) {
							if (html.charCodeAt(pos) === openCornerBracketCC) {
								encapsuled = true;
							} else if (
								encapsuled === true &&
								html.charCodeAt(pos) === closeCornerBracketCC
							) {
								encapsuled = false;
							}
							pos++;
						}
						children.push({
							type: VNodeType.Outher,
							text: html.substring(startDoctype, pos + 1),
						});
					}
					pos++;
					continue;
				}
				var node = parseNode();
				// XML能力，暂时不保留
				// if (skipXmlDeclaration && isXmlDeclarationTag(node.tagName)) {
				// 	continue;
				// }
				children.push(node);
			} else {
				var text = parseText();
				if (keepWhitespace) {
					if (text.length > 0) {
						children.push(text);
					}
				} else {
					var trimmed = text.trim();
					if (trimmed.length > 0) {
						children.push(trimmed);
					}
				}
				pos++;
			}
		}
		return children;
	}
	function parseName() {
		var start = pos;
		while (nameSpacer.indexOf(html[pos]) === -1 && html[pos]) {
			pos++;
		}
		return html.slice(start, pos);
	}
	function parseString() {
		var startChar = html[pos];
		var startpos = pos + 1;
		pos = html.indexOf(startChar, startpos);
		var value = html.slice(startpos, pos);
		return value;
	}
	function parseNode(): HTMLVElement {
		pos++;
		const tagName = parseName();
		const isProcessingInstruction = tagName[0] === "?";
		const instructionContentStart = pos;
		const attributes: Record<string, string | null> = {};
		let children: HTMLVNode[] = [];

		// parsing attributes
		while (
			html[pos] &&
			html.charCodeAt(pos) !== closeBracketCC &&
			!(
				isProcessingInstruction &&
				html.charCodeAt(pos) === questionMarkCC &&
				html.charCodeAt(pos + 1) === closeBracketCC
			)
		) {
			var c = html.charCodeAt(pos);
			if ((c > 64 && c < 91) || (c > 96 && c < 123)) {
				var name = parseName();
				var value: string | null = null;

				// Skip whitespace after the attribute name.
				while (
					html.charCodeAt(pos) === 32 ||
					html.charCodeAt(pos) === 9 ||
					html.charCodeAt(pos) === 10 ||
					html.charCodeAt(pos) === 13
				) {
					pos++;
				}

				if (html.charCodeAt(pos) === equalSignCC) {
					pos++;

					// Skip whitespace after '='.
					while (
						html.charCodeAt(pos) === 32 ||
						html.charCodeAt(pos) === 9 ||
						html.charCodeAt(pos) === 10 ||
						html.charCodeAt(pos) === 13
					) {
						pos++;
					}

					var code = html.charCodeAt(pos);
					if (code === singleQuoteCC || code === doubleQuoteCC) {
						value = parseString();
						if (pos === -1) {
							return {
								type: VNodeType.Element,
								tagName,
								attributes,
								children,
							};
						}
					} else if (code && code !== closeBracketCC) {
						// HTML-style unquoted attribute value: read until whitespace, '/', or '>'.
						var valueStart = pos;
						while (html[pos] && nameSpacer.indexOf(html[pos]) === -1) {
							pos++;
						}
						value = html.slice(valueStart, pos);
					}
				}
				attributes[name] = value;
				continue;
			}
			pos++;
		}

		const isExplicitSelfClosed =
			!isProcessingInstruction && html.charCodeAt(pos - 1) === slashCC;

		if (isProcessingInstruction) {
			var instructionContent = html.slice(instructionContentStart, pos).trim();

			if (
				instructionContent.length > 0 &&
				Object.keys(attributes).length === 0
			) {
				children = [instructionContent];
			}

			if (
				html.charCodeAt(pos) === questionMarkCC &&
				html.charCodeAt(pos + 1) === closeBracketCC
			) {
				pos += 2;
			} else if (html.charCodeAt(pos) === closeBracketCC) {
				pos += 1;
			}

			return {
				type: VNodeType.Element,
				tagName,
				attributes,
				children,
			};
		}

		// optional parsing of children
		if (
			html.charCodeAt(pos - 1) !== slashCC &&
			html.charCodeAt(pos - 1) !== questionCC
		) {
			if (noChildTag.includes(tagName)) {
				// TODO: 这里其实要检查是否在字符串中
				const endTag = `</${tagName}>`;
				var start = pos + 1;
				pos = html.indexOf(endTag, pos);
				children = [html.slice(start, pos)];
				pos += endTag.length;
			} else if (SelfClosingTags.indexOf(tagName) === -1) {
				pos++;
				children = parseChildren(tagName);
			} else {
				pos++;
			}
		} else {
			pos++;
		}
		const node: HTMLVElement = {
			type: VNodeType.Element,
			tagName,
			attributes,
			children,
		};

		if (isExplicitSelfClosed) {
			Object.defineProperty(node, "selfClosed", {
				value: true,
				enumerable: false,
				writable: true,
				configurable: true,
			});
		}

		return node;
	}

	function parseText() {
		var start = pos;
		pos = html.indexOf(openBracket, pos) - 1;
		if (pos === -2) pos = html.length;
		var text = html.slice(start, pos + 1);
		return text;
	}
	return parseChildren("");
}
