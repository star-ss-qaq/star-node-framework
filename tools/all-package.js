"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProjects = loadProjects;
exports.getProjectAliasObj = getProjectAliasObj;
function __assignType(fn, args) {
    fn.__type = args;
    return fn;
}
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const url_1 = require("url");
const __ΩProjectInfo = ['name', 'version', 'location', 'ProjectInfo', 'P&4!&4"&4#Mw$y'];
function loadProjects() {
    const filePath = (0, path_1.join)((0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url)), "..", "node_modules", ".sf-tmp", "projects.json");
    try {
        return JSON.parse((0, fs_1.readFileSync)(filePath, "utf-8"));
    }
    catch { }
    const projects = JSON.parse((0, child_process_1.execSync)("npx lerna list --long --all --json", {
        encoding: "utf-8",
        stdio: "pipe",
    }));
    (0, fs_1.mkdirSync)((0, path_1.dirname)(filePath), { recursive: true });
    (0, fs_1.writeFileSync)(filePath, JSON.stringify(projects));
    return projects;
}
loadProjects.__type = [() => __ΩProjectInfo, 'loadProjects', 'Pn!F/"'];
function getProjectAliasObj() {
    const projects = loadProjects();
    return Object.fromEntries(projects.map(__assignType((i) => [i.name, (0, path_1.join)(i.location, "src/index.ts")], ['i', '', 'P"2!"/"'])));
}
getProjectAliasObj.__type = ['getProjectAliasObj', 'P"/!'];
//# sourceMappingURL=all-package.js.map