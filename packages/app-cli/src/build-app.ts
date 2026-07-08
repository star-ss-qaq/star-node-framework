import { ParamType } from "@thestarweb/star-framework-param-helper";
import { getCommands, Type } from "./command.js";
import { callWhithParam, getParam } from "./params.js";

function dumpInfo(type: ParamType): string {
	switch (type.type) {
		case "anyOf":
			return type.anyOf.map(dumpInfo).join("|");
		case "array":
			if (Array.isArray(type.items)) {
				return type.items.map((t) => dumpInfo(t)).join(" ");
			} else {
				return `...${dumpInfo(type.items)}`;
			}
	}
	return type.type;
}

function showHelpFor(obj: object, propertyKey?: PropertyKey) {
	if (propertyKey) {
		const param = getParam(obj, propertyKey);
		const res = [];
		if (param.types.arg) {
			const { required, type } = param.types.arg;
			const argInfo = dumpInfo(type);
			res.push("");
			res.push(`Arguments: ${required ? `<${argInfo}>` : `[${argInfo}]`}`);
			res.push("");
		}
		if (param.types.options) {
			res.push("");
			res.push("Options:", "");
			const { required, type } = param.types.options;
			Object.keys(type.properties).forEach((i) => {
				if (type.properties[i].type === "never") {
					return;
				}
				const argInfo = dumpInfo(type.properties[i]);
				res.push(
					`\t--${i} ${required && type.required ? `<${argInfo}>` : `[${argInfo}]`}\t\t${type.properties[i].description}`,
				);
			});
			res.push("");
		}
		return res.join("\n");
	} else {
		const commands = getCommands(obj);
		const cmdNames = Object.keys(commands);
		if (cmdNames.length > 0) {
			//
		}
	}
}

async function callOn(
	obj: object,
	arg: string[],
	p: string[] = [],
): Promise<boolean> {
	const commands = getCommands(obj);
	let subCommand = "";
	let subArg = arg;
	if (!arg[0]?.startsWith("-")) {
		subCommand = arg[0] || "";
		const subArg = arg.slice(1);
	}
	const commandInfo = commands[subCommand];
	if (commands[subCommand]) {
		const t = (obj as any)[commandInfo.propertyKey];
		if (commandInfo.type === Type.set) {
			return callOn(t, subArg, [...p, subCommand]);
		} else {
			const param = getParam(obj, commandInfo.propertyKey);
			if (arg.includes("--help") && param.types.options?.type.properties.help) {
				console.log(showHelpFor(obj, commandInfo.propertyKey));
				if (subCommand === "" && Object.keys(commands).length > 1) {
					console.log(showHelpFor(obj));
				}
			}
			const p = {
				arg: [] as string[],
				interaction: {} as any,
				options: {} as any,
			};
			let currentFlag = "";
			let currentV: string[] = [];
			const end = () => {
				if (currentFlag) {
					switch (param.types.options!.type.properties[currentFlag].type) {
						case "array":
							p.options[currentFlag] = currentV;
							break;
						case "boolean":
							if (currentV.length === 0) {
								p.options[currentFlag] = true;
							} else if (
								currentV.length === 1 &&
								["0", "1", "true", "false"].includes(currentV[0])
							) {
								p.options[currentFlag] = ["1", "true"].includes(currentV[0]);
							} else {
								console.error(
									`--${currentFlag} should only use no value or true/false/0/1 but got ${currentV.join(" ")}`,
								);
								process.exit(1);
							}
							break;
						default:
							if (currentV.length > 1) {
								console.error(
									`--${currentFlag} is not array, but ${currentV.length} given`,
								);
								process.exit(1);
							}
							p.options[currentFlag] = currentV[0];
					}
				}
				currentV = [];
			};
			let c: string | undefined;
			while ((c = subArg.shift())) {
				if (c.startsWith("--")) {
					end();
					currentFlag = c.substring(2);
					if (p.options[currentFlag]) {
						console.error(`duplicate option --${currentFlag}`);
						process.exit(1);
					}
					if (!param.types.options?.type.properties[currentFlag]) {
						console.error(`unknow option --${currentFlag}`);
						process.exit(1);
					}
				} else if (currentFlag) {
					currentV.push(c);
				} else {
					p.arg.push(c);
				}
			}
			end();
			await callWhithParam(obj, commandInfo.propertyKey, p);
		}
	}
	return false;
}

export function buildApp(obj: any) {
	return async (arg: string[]) => {
		await callOn(obj, arg.slice(2));
	};
}
