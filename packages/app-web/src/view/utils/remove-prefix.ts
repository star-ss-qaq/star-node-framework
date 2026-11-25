export function removePrefix(path: string, prefix: string) {
	let t = path.substring(prefix.length);
	if (!t.startsWith("/")) t = `/${t}`;
	return t;
}
