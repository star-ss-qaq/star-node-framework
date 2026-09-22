import { SFDataContext } from "@thestarweb/star-framework-app-web";
import { computed, ComputedRef, ShallowRef, shallowRef } from "vue";

export type GetSFDataContextType<T extends SFDataContext<any>> =
	T extends SFDataContext<infer R> ? R : unknown;

export function sfContextToRef<T extends SFDataContext<any>>(
	context: T,
): ComputedRef<GetSFDataContextType<T>> {
	const r = shallowRef(context.value);
	context.watch((newValue) => {
		r.value = newValue;
	});
	return computed(() => r.value);
}
