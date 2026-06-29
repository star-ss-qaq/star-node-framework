import {
	isCustomTypeClass,
	TypeClass,
	TypeFunction,
	typeOf,
} from "@deepkit/type";
import {
	getClassConstructorInjectTokens,
	getClassPropertyInjectTokens,
	getFunctinInjectTokens,
	InjectInfo,
} from "./@inject";
import { getModuleMetadata, ModuleMeta } from "./@module";
import { Provider } from "./provider";

export class DIContainer {
	private readonly metadata: ModuleMeta;
	constructor(
		private module: new (...prop: any[]) => any,
		private parent?: DIContainer,
	) {
		this.providerInstances.set(DIContainer, this);
		this.metadata = getModuleMetadata(module) || {};
		this.providers.set(module, module);
		this.metadata.providers?.forEach((p) => {
			this.providers.set(typeof p === "object" ? p.token : p, p);
		});
	}
	private providers: Map<any, Provider> = new Map();
	private providerInstances: Map<any, any> = new Map();
	private providerInstancesPromise: Map<any, any> = new Map();
	private async _tryCreate(
		info: InjectInfo,
		failMessage: string,
		loop2: any[],
	) {
		let p = null;
		if (info.token) {
			try {
				p = await this._resolve(info.token, loop2);
			} catch (e) {
				console.warn(e);
			}
		}
		if (!p && info.required) {
			throw new Error(`Cannot resolve dependency for ${failMessage}.`);
		}
		return p || undefined;
	}
	private async _createClass(token: any, classCons: any, loop: any[]) {
		if (classCons !== this.module && getModuleMetadata(classCons)) {
			const subIns = new DIContainer(classCons, this);
			return await subIns.resolve(classCons);
		}
		const type = typeOf<typeof classCons>() as TypeClass;
		const prop: any[] = await Promise.all(
			getClassConstructorInjectTokens(type.classType).map(async (arg, index) =>
				this._tryCreate(
					arg,
					`class ${type.classType.name} constructor argument ${index}`,
					loop,
				),
			),
		);
		const instance = new type.classType(...prop);
		this.providerInstances.set(token, instance);
		await Promise.all(
			Object.entries(getClassPropertyInjectTokens(type.classType)).map(
				async ([key, info]) => {
					instance[key] = await this._tryCreate(
						info,
						`class ${type.classType.name} property ${key}`,
						[],
					);
				},
			),
		);
		return instance;
	}
	private async _createFromFactory(
		fn: (...arg: any[]) => any,
		inject: any[] = [],
		loop: any[],
	) {
		const props = await Promise.all(
			getFunctinInjectTokens(fn, inject).map(
				async (p, i) =>
					await this._tryCreate(p, `function argument ${i}`, loop),
			),
		);
		return await fn(...props);
	}
	private async create<T>(token: T, allowAutoCreate = false, loop: any[] = []) {
		if (loop.includes(token)) {
			const fToken = (t: any) => t.name || t.toString();
			throw new Error(
				`Circular dependency detected for token: ${loop
					.slice(loop.indexOf(token))
					.map(fToken)
					.join(" -> ")} -> ${fToken(token)}`,
			);
		}
		const newLoop = [...loop, token];
		if (this.providers.has(token)) {
			const p = this.providers.get(token)!;
			if (typeof p === "function") {
				const type = typeOf<typeof p>();
				if (isCustomTypeClass(type)) {
					return await this._createClass(token, type.classType, newLoop);
				}
				return await this._createFromFactory(p as any, [], newLoop);
			} else if ("value" in p) {
				return p.value;
			} else if ("class" in p) {
				return await this._createClass(token, p.class, newLoop);
			} else if ("factory" in p) {
				return await this._createFromFactory(p.factory, p.inject, newLoop);
			}
		}
		const type = typeOf<T>();
		if (allowAutoCreate && isCustomTypeClass(type)) {
			return await this._createClass(token, type.classType, newLoop);
		}
		return null;
	}
	private async _resolve<T>(token: T, loop: any[] = []): Promise<any> {
		if (!this.providerInstances.has(token)) {
			if (!this.providerInstancesPromise.has(token)) {
				const promise = this.create(token, !this.parent, loop);
				this.providerInstancesPromise.set(token, promise);
				// promise.finally(() => this.providerInstancesPromise.delete(token));
				promise
					// .then(() => {})
					.catch(() => {}) // 有点奇怪 这里不catch直接finally似乎会影响到原本的promise
					.finally(() => this.providerInstancesPromise.delete(token));
			}
			let instance = await this.providerInstancesPromise.get(token);
			if (instance) {
				this.providerInstances.set(token, instance);
			}
		}
		return this.providerInstances.has(token)
			? this.providerInstances.get(token)
			: (await this.parent?._resolve(token)) || null;
	}
	async resolve<T = any>(token: { new (...prop: any[]): T }): Promise<T | null>;
	async resolve<T = any>(token: any): Promise<T | null>;
	async resolve<T>(token: any): Promise<T | null> {
		return await this._resolve<T>(token);
	}
	get<T = any>(token: { new (...prop: any[]): T }): T | null;
	get<T = any>(token: any): T | null;
	get<T = any>(token: any): T | null {
		if (this.providerInstances.has(token)) {
			return this.providerInstances.get(token);
		}
		if (this.parent) {
			return this.parent.get(token);
		}
		return null;
	}
}
