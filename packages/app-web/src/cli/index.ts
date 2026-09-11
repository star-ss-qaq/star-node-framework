import { type SFPluging } from "@thestarweb/star-framework-cli";
import { devServer } from "./dev-server.js";
import { dirname, join, relative } from "path";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
import { PackageInfo } from "@thestarweb/star-framework-web-runtime-node";
import { fileURLToPath } from "url";

export * from "./types.js";
const __file = fileURLToPath(import.meta.url);
const __dir = dirname(__file);

export function SFWebPluging({
	distPath = "./dist/web/",
	htmlPath = join(__dir, "../../resource/default-index.html"),
} = {}): SFPluging {
	const fullDistPath = join(process.cwd(), distPath);
	const fullUnpackDistPath = join(distPath, ".unpack");

	let html = "";
	try {
		html = readFileSync(htmlPath, "utf-8");
	} catch {
		throw new Error("未能找到html文件");
	}

	return {
		name: "sf-web",
		mode: {
			server: {
				side: ["server"],
				dev: devServer(html),
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
					fnName: "createBrowsweInstance",
				},
			},
		},
		siteOnlyConfig: [
			{
				import: "@thestarweb/star-framework-app-web",
				name: ["Get", "Post", "Put", "Delete"],
				side: "server",
				type: "include",
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
			let packageName = "sf-web",
				packageVersion = "1.0.0";
			try {
				const pJson = JSON.parse(readFileSync("package.json", "utf-8"));
				pJson.name ?? (packageName = pJson.name);
				pJson.version ?? (packageVersion = pJson.version);
			} catch {}
			await writeFile(
				configFile,
				JSON.stringify({
					"sf-fomate": "1",
					name: packageName,
					version: packageVersion,
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
