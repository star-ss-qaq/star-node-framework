import { transformer } from "@deepkit/type-compiler";
import {
	createProgram,
	isIdentifier,
	isIfStatement,
	isPropertyAccessExpression,
	visitEachChild,
} from "typescript";

export default (program, config) => {
	const cwd = process.cwd().replaceAll("\\", "/") + "/";

	return (context) => {
		const host = (context.getEmitHost());
		const originalWriteFile = host.writeFile;
		host.writeFile = (fileName, ...rest) => {
			if(!fileName.startsWith(cwd)) {
				return;
			}
			return originalWriteFile.call(program,fileName,  ...rest);
		};
		const p = transformer(context);
		return (sf) => {
			const shouldRemove = [];
			const v = (node) => {
				if (isIfStatement(node)) {
					if (
						isPropertyAccessExpression(node.expression) &&
						isPropertyAccessExpression(node.expression.expression) &&
						isIdentifier(node.expression.expression.expression) &&
						node.expression.expression.expression.text === "process" &&
						node.expression.expression.name.text === "env" &&
						node.expression.name.text === "SF_DEV"
					) {
						shouldRemove.push(node);
						return [];
					}
				}
				return visitEachChild(node, v, context);
			};
			let res = p.transformSourceFile(v(sf));
			return res;
		};
	};
};
