// vite-loader.mjs
import { createServer } from "vite";
import { pathToFileURL as rawPathToFileURL, fileURLToPath as rawFileURLToPath } from "node:url";
import { readFileSync, existsSync, write } from "node:fs";
import { resolve as resolvePath, dirname, extname, normalize } from "node:path";

const viteServer = await createServer({
	server: { hmr: false, watch: null },
	optimizeDeps: { noDiscovery: true, include:[] },
	appType: "custom",
});
const vpre='file://__vite__/'
function pathToFileURL(path){
	if(path.startsWith('\0')){
		return `${vpre}${Buffer.from(path).toString('base64')}`
	}
	return rawPathToFileURL(path).href;
}
function fileURLToPath(path){
	path = path.replaceAll('\\','/')
	if(path.startsWith(vpre)){
		return Buffer.from(path.substring(vpre.length),'base64').toString('utf-8')
	}
	return rawFileURLToPath(path).replaceAll('\\','/');
}
// ═══════════════════════════════════════
//  resolve hook —— 模块路径解析
// ═══════════════════════════════════════
export async function resolve(specifier, context, nextResolve) {
	// 只有node_module的文件不需要
	if (!specifier.includes('node_modules')) {
		const parentPath = context.parentURL
			? fileURLToPath(context.parentURL)
			: undefined;
		try {
			const resolved = await viteServer.pluginContainer.resolveId(
				specifier,
				parentPath,
				{ ssr: true },
			);
			if (resolved?.id && !resolved.external) {
				return { shortCircuit: true, url: pathToFileURL(resolved.id) };
			}
		} catch {
			// Vite resolver 也失败了，继续下面的手动兜底
		}
	}
	// 其他情况转原生解析或其他loader
	return await nextResolve(specifier, context);
}

// ═══════════════════════════════════════
//  load hook —— 文件加载 & 转换
// ═══════════════════════════════════════
export async function load(url, context, nextLoad) {
	if (!url.includes('node_modules')) {
		try{
			const filePath = fileURLToPath(url);
			const ext = extname(filePath);
			//environments.ssr
			viteServer.environments.ssr.moduleGraph.ensureEntryFromUrl(filePath);
			// ── Step 1: pluginContainer.load ──
			// 让插件提供源码（虚拟模块、自定义 loader 等）
			const loadResult = await viteServer.pluginContainer.load(filePath, { ssr: true });

			// 若无插件处理，直接读文件
			let code =
				loadResult?.code != null
					? loadResult.code
					: readFileSync(filePath, "utf-8");

			// ── Step 2: pluginContainer.transform ──
			// 关键点：
			//   ssr: true  → importAnalysis 插件跳过（不改写 import 路径）
			//   直接调用    → 不经过 transformRequest 里的 SSR 转换
			// 结果：TypeScript/JSX/Vue 全部编译为 JS，import/export 原样保留
			const result = await viteServer.pluginContainer.transform(code, filePath, {
				ssr: true,
			});

			if (!result?.code) {
				return nextLoad(url, context);
			}

			// ── Step 3: 附加 inline source map ──
			let source = result.code;
			if (result.map) {
				const map =
					typeof result.map === "string" ? result.map : JSON.stringify(result.map);
				source += `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(map).toString("base64")}`;
			}
			return {
				format: "module", // 明确告诉 Node.js 这是 ESM
				source, // 编译后的 JS 代码
				shortCircuit: true, // 不再调用后续 loader
			};
		}catch(e){
			console.error('can not load by vite:',e)
			return nextLoad(url, context);
		}
	}
	return nextLoad(url, context);
}
