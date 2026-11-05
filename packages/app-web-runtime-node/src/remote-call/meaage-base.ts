export class MessageBase{
  constructor(private _sendMessage: (message: Uint8Array) => void,){}
	private currentMessage?: Uint8Array;
  private lastMessage: Promise<void> = Promise.resolve();
	private messageResolve?: () => void;
	public sendMessage(message: Uint8Array) {
		return (this.lastMessage = this.lastMessage.then(
			() =>
				new Promise<void>((r) => {
					this.messageResolve = r;
					this.currentMessage = message;
					this._sendMessage(message);
				}),
		));
	}
  public messageSuccess(){
    this.messageResolve?.()
  }
}