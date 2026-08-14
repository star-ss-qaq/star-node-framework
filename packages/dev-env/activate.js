import { execSync, spawnSync } from "child_process";
import { userInfo } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const tag = "\x1b[36m(SF-DEV)\x1b[0m"

const t = [
	{
		main: ["bash", "sh"],
		args: ['-c',`exec bash --init-file <(echo "export PS1=\\"${tag}\\\\\\\\w$\\"")`],
	},
	{
		main: [
			"powershell",
			"C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
		],
		args: [
			"-NoExit",
			"-Command",
			`function prompt { "PS${tag} $((Get-Location).Path)> " }`,
		],
	},
	{
		main: ["cmd"],
		args: ["/k", `PROMPT=${tag} $P$G`],
	},
];

const nodePath = process.execPath;
const path = fileURLToPath(import.meta.url);
const fakeNodePath = join(dirname(path),'fake-node');
const viteNodeJS = join(dirname(path),'fake-node/vite-node.js');
// const viteConfig = 

let flag = false;

for (var i = 0; i < t.length; i++) {
	const cmd = t[i];
	for (var j = 0; j < cmd.main.length; j++) {
		try {
			const handler = spawnSync(cmd.main[j], cmd.args, {
				stdio: "inherit",
				env: {
					...process.env,
					PATH: `${fakeNodePath};${process.env.PATH}`,
                    REL_NODE_PATH: nodePath,
					FAKE_NODE_JS: viteNodeJS,
				},
			});
            if(!handler.error){
                flag = true;
                break;
            }
		} catch {}
	}
	if (flag) break;
}
if (!flag) {
	throw new Error("未找到可用的终端程序，请安装 bash、powershell 或 cmd");
}
