let { signal } = new AbortController();
export function getRequestAbortSignal() {
	return signal;
}
export function setRequestAbortSignal(signal2: AbortSignal) {
	signal = signal2;
}
