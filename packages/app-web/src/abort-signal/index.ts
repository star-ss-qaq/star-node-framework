let relGetAbortSignal = () => new AbortController().signal;
export function setRequestAbortSignalFn(fn: typeof relGetAbortSignal) {
	relGetAbortSignal = fn;
}
export function getRequestAbortSignal() {
	return relGetAbortSignal();
}
export function mergeAbortSignal(...signals: AbortSignal[]) {
	const ctrl = new AbortController();
	function handle(ev: Event) {
		ctrl.abort(ev);
		signals.forEach((i) => i.removeEventListener("abort", handle));
	}
	signals.forEach((i) => i.addEventListener("abort", handle));
	return ctrl.signal;
}
