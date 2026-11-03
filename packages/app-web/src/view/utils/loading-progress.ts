export class LoadingProgress {
	private div = document.createElement("div");
	private span = document.createElement("span");
	private constructor() {
		this.div.className = "sf-page-loading-progress";
		this.div.append(this.span);
		document.body.append(this.div);
		this.span.addEventListener("transitionend", () => {
			if (this.progress >= 100) {
				this.div.style.display = "none";
			} else {
				this.progress = 1 - (1 - this.progress) * 0.9;
			}
		});
	}
	static _instance: LoadingProgress;
	static get instance() {
		if (!this._instance) {
			this._instance = new LoadingProgress();
		}
		return this._instance;
	}
	private _progress = 0;
	get progress() {
		return this._progress;
	}
	set progress(value: number) {
		this._progress = value;
		this.div.style.setProperty("--progress", this._progress.toString());
	}
	set transitionTime(value: number) {
		this.div.style.setProperty("--transition-time", value.toString());
	}
	timeout?: NodeJS.Timeout;
	interval?: NodeJS.Timeout;
	private stop() {
		clearTimeout(this.timeout);
		clearInterval(this.interval);
	}
	start() {
		this.stop();
		this.div.style.display = "block";
		this.transitionTime = 0;
		this.progress = 0;
		this.timeout = setTimeout(() => {
			this.transitionTime = 2;
			this.progress = 0.2;
		}, 100);
	}
	end() {
		if (this.progress <= 0.2) {
			this.div.style.display = "none";
		}
		this.stop();
		this.transitionTime = 0.2;
		this.progress = 100;
	}
}
