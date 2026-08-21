import { createServer } from "vite";

import { spawnSync } from "node:child_process";
import { argv, exit } from "node:process";
import { dirname, join, normalize } from "node:path";
import { realpathSync } from "node:fs";

function isInNodeMoudles(file){
    if(!file) return false;
    file = normalize(file);
    if(!file.includes('node_modules')) return false;
    const path = file.replaceAll('\\','/').split('/');
    const index = path.indexOf('node_modules')
    if(index<0)return false;
    let checkPath = path.slice(0,index+(path[index+1]?.[0]==='@'?3:2)).join('/');
    const normalizeFile = realpathSync(checkPath);
    return normalizeFile.includes('node_modules');
}

const arg = process.argv.slice(2);
// console.log(process.argv,process.argv[2], normalize(process.argv[2]).includes('node_modules'))
if (isInNodeMoudles(process.argv[2])) {
} else {
	// console.log("using vite-node",process.cwd());
	arg.unshift('--import', join(dirname(import.meta.url), 'register.mjs').replace(/^\.\\/,''));
}
spawnSync(process.execPath, arg, {
	stdio: "inherit",
});
