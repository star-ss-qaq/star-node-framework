export class SFDataContext<T> {
	private constructor(private _root: SFRawDataContext<T>) {}
	get value() {
		return this._root.value;
	}
	private callbacks = new Set<(newValue: T) => void>();
	private children = new Set<SFDataContext<T>>();
	fock() {
		return this._root.createChild();
	}
	watch(callback: (newValue: T) => void, updateNow = false) {
		if (this.callbacks.size === 0)
			// @ts-ignore 2341
			this._root.children.add(this);
		this.callbacks.add(callback);
		if (updateNow) callback(this.value);
	}
	distory() {
		this._root.distoryChild(this);
	}
}
export class SFRawDataContext<T> {
	constructor(private _value: T) {}
	get value() {
		return this._value;
	}
	update(newValue: T) {
		this._value = newValue;
		const called = new Set();
		this.children.forEach((i) => {
			(i as any).callbacks.forEach((c: any) => {
				if (!called.has(c)) {
					called.add(c);
					c(newValue);
				}
			});
		});
	}
	private children = new Set<SFDataContext<T>>();
	createChild() {
		const child: SFDataContext<T> =
			// @ts-ignore
			new SFDataContext(this);
		return child;
	}
	distoryChild(child: SFDataContext<T>) {
		this.children.delete(child);
	}
}
export function forkDataContextRecord<T extends Record<keyof T, any>>(
	data: T,
): T {
	return Object.fromEntries(
		Object.entries(data).map(([k, context]) => [
			k,
			context instanceof SFDataContext ? context.fock() : context,
		]),
	) as T;
}
