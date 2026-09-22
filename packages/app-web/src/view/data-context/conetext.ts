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
		console.log(111);
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
		this.children.add(child);
		return child;
	}
	distoryChild(child: SFDataContext<T>) {
		this.children.delete(child);
	}
}
export function forkDataContextRecord<
	T extends Record<keyof T, SFDataContext<any>>,
>(data: T): T {
	return Object.fromEntries(
		Object.entries(data).map(([k, context]) => [
			k,
			(context as SFDataContext<any>).fock(),
		]),
	) as T;
}
