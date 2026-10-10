import { transformer } from "@deepkit/type-compiler";
import {
	isIdentifier,
	isIfStatement,
	isPropertyAccessExpression,
	visitEachChild,
} from "typescript";


export default (program, host, config) => {
	const originalWriteFile = host.writeFile;
	const cwd = process.cwd().replaceAll("\\", "/") + "/";
	host.writeFile = (fileName, data, ...rest) => {
		if(!fileName.startsWith(cwd)) {
			return;
		}
		return originalWriteFile.call(host, fileName, data, ...rest);
	};
	return (context) => {
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
