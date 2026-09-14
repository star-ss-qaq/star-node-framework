import { Node, SourceFile } from "typescript";
import { isKeepInSide } from "./side-check.js";

export function shouldRemoverByComment(
	currentSide: StarFrameworkSide[],
	node: Node,
) {
	try {
		let code = node.getFullText();
		const lines = code.replaceAll("\r", "\n").split("\n");
		for (let line of lines) {
			const metch = /^[ \t]*\/\/[ \t]*@side-(only|omit) (.+)/.exec(line);
			if (metch) {
				const [, mode, prop] = metch;
				const [sideStrArr] = prop.split(" ");
				return isKeepInSide(
					currentSide,
					sideStrArr.split(",") as StarFrameworkSide[],
					mode == "only" ? "SFSiteOnly" : "SFSiteOmit",
					false,
					true,
				);
			}
			if (!/^[ \t]*\/\//.test(line) && line) break;
		}
	} catch {}
	return false;
}
