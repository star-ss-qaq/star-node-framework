export function callWithHook<P extends any[], R>(
	rawCall: (...prop: P) => R,
	hook:
		| ((
				...prop: P
		  ) =>
				| R
				| undefined
				| (R extends Promise<any> ? Promise<undefined> : never))
		| undefined,
	...arg: P
): R {
	if (hook) {
		const hookRet = hook(...arg);
		if (typeof hookRet !== undefined) {
			if (hookRet instanceof Promise) {
				return hookRet.then((ret) => {
					if (typeof ret !== undefined) return ret;
					return rawCall(...arg);
				}) as R;
			}
			return hookRet!;
		}
	}
	return rawCall(...arg);
}
