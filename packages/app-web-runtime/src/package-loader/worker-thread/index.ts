import { RequestProp } from "../../types/index.js";
import {
	BasePackageLoader,
	CommonPackageConfig,
} from "../base-package-loader.js";
import { WorkerMainThreadCtrl } from "./main-thread-ctrl.js";

export class PackageWorkerThreadLoader extends BasePackageLoader {
	public get config() {
		return this._config;
	}
	activeIns: WorkerMainThreadCtrl[] = [];
	loadingIns: Set<WorkerMainThreadCtrl> = new Set();
	get loading() {
		if (this.loadingIns.size > 0) {
			return Promise.all([...this.loadingIns].map((i) => i.loading));
		}
	}
	onInsOnline(ins: WorkerMainThreadCtrl) {
		this.activeIns = [...new Set(this.activeIns).add(ins)];
		this.loadingIns.delete(ins);
		if (
			this.activeIns.length + this.loadingIns.size <
			this._config.expectationCount!
		) {
			this.load(true);
		} else {
			if (this.activeIns.length > this._config.expectationCount!) {
				this.activeIns.shift()!.kill();
			}
			if (this.activeIns[0].version < this.currentVersion) {
				// 更新下一个实例
				this.load(true);
			}
		}
	}
	onInsError(ins: WorkerMainThreadCtrl) {
		this.activeIns = this.activeIns.filter((i) => i !== ins);
		this.loadingIns.add(ins);
	}
	async load(isReload: boolean) {
		if (isReload) {
			this.loadingIns.add(new WorkerMainThreadCtrl(this));
		} else {
			for (var i = 0; i < this._config.expectationCount!; i++) {
				this.loadingIns.add(new WorkerMainThreadCtrl(this));
			}
		}
		await this.loading;
	}
	async loadPackageInfo() {
		await super.loadPackageInfo();
		if (!this._config.expectationCount) {
			this._config.expectationCount = 1;
		}
	}
	constructor(
		protected _config: CommonPackageConfig & {
			expectationCount?: number;
			env?: Record<string, string>;
			cwd?: string;
			arg?: string[];
		},
	) {
		super(_config);
	}
	async onRequest(prop: RequestProp) {
		if (this.activeIns.length === 0) {
			return { code: 500, header: {}, data: null };
		}
		// TODO 如果有多个存活实例，应该做负载均衡，同时可能需要考虑动态扩容
		return this.activeIns[0].onRequest(prop);
	}
	kill() {
		this._config.expectationCount = 0;
		this.activeIns.forEach((i) => i.kill());
		this.activeIns = [];
		this.loadingIns.forEach((i) => i.kill());
		this.loadingIns.clear();
	}
}
