import { basename } from "path";
import {
	CompilerOptions,
	createPrinter,
	createSourceFile,
	// @ts-ignore
	createSourceMapGenerator,
	// @ts-ignore
	createTextWriter,
	ModuleKind,
	readConfigFile,
	ScriptTarget,
	SourceFile,
	sys,
	transform,
	TransformerFactory,
} from "typescript";

export function withTransform(
	code: string,
	transformers: TransformerFactory<SourceFile>[],
	file: string = "",
	compilerOptions: CompilerOptions = {},
) {
	const sf = createSourceFile(
		file,
		code,
		{
			languageVersion: ScriptTarget.ESNext,
			impliedNodeFormat: ModuleKind.ESNext,
		},
		true,
	);
	const transformed = transform(sf, transformers, compilerOptions);
	const print = createPrinter();
	const sMap = createSourceMapGenerator(
		{
			getCurrentDirectory: () => process.cwd(),
			getCanonicalFileName: (path: string) => path,
		},
		basename(file),
		process.cwd(),
		process.cwd(),
		{},
	);
	const w = createTextWriter("\n");
	// @ts-ignore
	print.writeFile(transformed.transformed[0], w, sMap);
	return {
		code: w.getText() as string,
		map: sMap.toString(),
	};
}
export function createTransformTool(
	transformers: TransformerFactory<SourceFile>[],
	tsConfig: string | CompilerOptions = "tsconfig.json",
) {
	const t =
		typeof tsConfig === "string"
			? readConfigFile(tsConfig, sys.readFile).config?.compilerOptions || {}
			: tsConfig;
	return (code: string, fileName?: string) =>
		withTransform(code, transformers, fileName, t);
}
