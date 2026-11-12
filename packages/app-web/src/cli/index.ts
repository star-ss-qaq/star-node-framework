import { type SFPluging } from "@thestarweb/star-framework-cli";
import { devServer, DevServerConfig } from "./dev-server.js";
import { dirname, join, relative } from "path";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import { PackageInfo } from "@thestarweb/star-framework-web-runtime-node";
import { fileURLToPath } from "url";
import { parseHtmlToVDom, renderVDomToString } from "../view/html/index.js";

export * from "./types.js";
const __file = fileURLToPath(import.meta.url);
const __dir = dirname(__file);

export function SFWebPlugin({
	distPath = "./dist/web/",
	htmlPath = join(__dir, "../../resource/default-index.html"),
	devServer: devServerConfig = {} as DevServerConfig,
} = {}): SFPluging {
	const fullDistPath = join(process.cwd(), distPath);
	const fullUnpackDistPath = join(fullDistPath, ".unpack");

	let html = "";
	try {
		const sysScript = `<script type="module">import "sf:main"</script>`;
		const sysStyle = `<style>${readFileSync(join(__dir, "../../resource/base-style.css"), "utf-8")}</style>`;
		// const sysStyle = `<link rel="stylesheet" href=${JSON.stringify(join(__dir, "../../resource/base-style.css"))}>`;
		html = renderVDomToString(
			parseHtmlToVDom(readFileSync(htmlPath, "utf-8")),
			{
				customizeChildrenRender(dom) {
					if (dom.tagName === "head") {
						return (dom, raw) => `${raw()}${sysScript}${sysStyle}`;
					}
				},
			},
		);
	} catch {
		throw new Error("未能找到html文件");
	}

	return {
		name: "sf-web",
		mode: {
			server: {
				side: ["server"],
				dev: devServer(html, devServerConfig),
				environments: {
					build: { outDir: join(fullUnpackDistPath, "server") },
				},
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createServerFactory",
				},
			},
			browser: {
				side: ["browser", "client"],
				environments: {
					input: "index.html",
					consumer: "client",
					build: { outDir: join(fullUnpackDistPath, "browser") },
					plugins: [{ name: "test" }],
				},
				createApp: {
					import: "@thestarweb/star-framework-app-web",
					fnName: "createBrowserInstance",
				},
			},
		},
		sideOnlyConfig: [
			{
				import: "@thestarweb/star-framework-app-web",
				name: ["Get", "Post", "Put", "Delete"],
				side: "server",
				type: "include",
				whenMethodDeclaration: {
					enable: true,
				},
			},
			{
				import: "@thestarweb/star-framework-app-web",
				name: ["View"],
				side: "server",
				type: "include",
				whenMethodDeclaration: {
					enable: true,
					removeMode: { prop: true, body: "throw" },
				},
			},
		],
		vitePlugin: {
			name: "sf-web-html",
			resolveId: {
				filter: { id: /^index\.html$/ },
				async handler(id) {
					return "index.html";
				},
			},
			load: {
				filter: { id: /^index\.html$/ },
				handler(id) {
					return html;
				},
			},
		},
		async onAllModeBuildEnd(modes, res) {
			const configFile = join(fullUnpackDistPath, "package-info.json");
			console.log("正在写入包信息");
			await writeFile(
				configFile,
				JSON.stringify({
					"sf-formate": "1",
					...(await import('./package-info.js')).info,
					buildAt: Date.now(),
					server: {
						dir: relative(fullUnpackDistPath, res.server.distPath),
						main: res.server.main[0],
					},
					browser: {
						dir: relative(fullUnpackDistPath, res.browser.distPath),
						main: res.browser.main[0],
						style: res.browser.assets.filter((i) => i.endsWith(".css")),
					},
				} as PackageInfo),
			);
			console.log("正在打包文件");
			// TODO 打包
		},
	};
}
