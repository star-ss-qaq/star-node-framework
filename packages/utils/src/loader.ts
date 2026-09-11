type MayPromise<T> = T | Promise<T>;
export type LoadableType<T> =
	| (() => MayPromise<T>)
	| (() => MayPromise<{ default: T }>);
export async function load<T>(t: LoadableType<T>) {
	const ret = await t();
	if (typeof ret === "object" && ret && "default" in ret)
		return ret.default as T;
	return ret as T;
}
