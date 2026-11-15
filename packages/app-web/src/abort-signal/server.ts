import { AsyncLocalStorage } from "async_hooks";

const reqStorage = new AsyncLocalStorage<AbortSignal>({
	defaultValue: new AbortController().signal,
});
export function runWithSignal<T extends (...arg: any) => any>(
	signal: AbortSignal,
	fn: T,
	...arg: Parameters<T>
): ReturnType<T> {
	return reqStorage.run(signal, fn, ...arg);
}
export function getRequestAbortSignal() {
	return reqStorage.getStore()!;
}
