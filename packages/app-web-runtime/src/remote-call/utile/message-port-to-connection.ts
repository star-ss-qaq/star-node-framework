enum MessageType {
	Message = 1,
	ReadyToRead = 2,
	WriteClose = 3,
	WriteAbort = 4,
	ReadCancel = 5,
}
enum Status {
	Open,
	Close,
	Abort,
}
export function messagePortToConnection(port: MessagePort, debugName: string) {
	let writeEnd = false;
	let remoteEnd = false;
	function checkEnd() {
		if (writeEnd && remoteEnd) {
			port.close();
		}
	}
	let tReady = false;
	let allowWriteCallback: () => void;
	const writable = new WritableStream<Uint8Array>({
		abort(reason) {
			writeEnd = true;
			if (!(reason instanceof ReadableCancel)) {
				port.postMessage({ type: MessageType.WriteAbort });
			}
			checkEnd();
		},
		close() {
			writeEnd = true;
			port.postMessage({ type: MessageType.WriteClose });
			checkEnd();
		},
		async write(data) {
			if (!tReady) {
				await new Promise<void>((r) => (allowWriteCallback = r));
			}
			port.postMessage(
				{ type: MessageType.Message, data },
				data.buffer ? [data.buffer] : [],
			);
			tReady = false;
		},
	});
	let dataCallback: ((data: Uint8Array | null) => void) | undefined;
	let remoteWriteableStatus = Status.Open;
	function checkRemote(
		r: ReadableStreamDefaultController,
		reject?: (d: any) => void,
	) {
		switch (remoteWriteableStatus) {
			case Status.Close:
				r.close();
				return true;
			case Status.Abort:
				if (reject) reject(new WriteableAbort());
				else throw new WriteableAbort();
		}
	}
	const readable = new ReadableStream<Uint8Array>({
		cancel() {
			port.postMessage({ type: MessageType.ReadCancel });
		},
		pull(controller) {
			if (checkRemote(controller)) return;
			return new Promise((resolve, reject) => {
				port.postMessage({ type: MessageType.ReadyToRead });
				dataCallback = (data) => {
					if (checkRemote(controller, reject) || !data) return;
					controller.enqueue(data);
					resolve();
					dataCallback = undefined;
				};
			});
		},
	});
	port.addEventListener("message", (ev) => {
		switch (ev.data.type) {
			case MessageType.Message:
				dataCallback?.(ev.data.data);
				break;
			case MessageType.ReadyToRead:
				tReady = true;
				allowWriteCallback?.();
				break;
			case MessageType.WriteClose:
				remoteEnd = true;
				checkEnd();
				remoteWriteableStatus = Status.Close;
				dataCallback?.(null);
				break;
			case MessageType.WriteAbort:
				remoteEnd = true;
				checkEnd();
				remoteWriteableStatus = Status.Abort;
				dataCallback?.(null);
				break;
			case MessageType.ReadCancel:
				writable.abort(new ReadableCancel());
				break;
		}
	});
	port.start();
	return { writable, readable };
}
class ReadableCancel extends Error {}
class WriteableAbort extends Error {}
