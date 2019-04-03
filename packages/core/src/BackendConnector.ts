import { EventEmitter } from "events";
import { IntifaceProtocols } from "intiface-protocols";
import { IntifaceConfiguration } from "./IntifaceConfiguration";

// Sends message from the backend (which handles file IO, network, etc...) to
// the frontend/GUI.
export abstract class BackendConnector extends EventEmitter {

  protected constructor() {
    super();
  }

  public SendMessage(aMsg: IntifaceProtocols.IntifaceBackendMessage) {
    this.SendMessageInternal(Buffer.from(IntifaceProtocols.IntifaceBackendMessage.encode(aMsg).finish()));
  }

  public SendOk(aMsg: IntifaceProtocols.IntifaceFrontendMessage) {
    const okMsg = IntifaceProtocols.IntifaceBackendMessage.create({
      ok: IntifaceProtocols.IntifaceBackendMessage.Ok.create(),
    });
    okMsg.index = aMsg.index;
    this.SendMessage(okMsg);
  }

  public SendError(aMsg: IntifaceProtocols.IntifaceFrontendMessage, aErrorMsg: string) {
    const errMsg = IntifaceProtocols.IntifaceBackendMessage.create({
      error: IntifaceProtocols.IntifaceBackendMessage.Error.create({
        reason: aErrorMsg,
      }),
    });
    errMsg.index = aMsg.index;
    this.SendMessage(errMsg);
  }

  public UpdateFrontendConfiguration(aConfig: IntifaceConfiguration,
                                     aMsg: IntifaceProtocols.IntifaceFrontendMessage | null) {
    const msg = IntifaceProtocols.IntifaceBackendMessage.create({
      configuration: IntifaceProtocols.IntifaceBackendMessage.Configuration.create({
        configuration: JSON.stringify(aConfig),
      }),
    });
    if (aMsg) {
      msg.index = aMsg.index;
    }
    this.SendMessage(msg);
  }

  public UpdateDownloadProgress(aProgress: any) {
    const msg = IntifaceProtocols.IntifaceBackendMessage.create({
      downloadProgress: IntifaceProtocols.IntifaceBackendMessage.DownloadProgress.create({
        bytesReceived: aProgress.receivedBytes,
        bytesTotal: aProgress.totalBytes,
      }),
    });
    this.SendMessage(msg);
  }

  protected abstract SendMessageInternal(aMsg: Buffer): void;

  // When we get something from the frontend, emit it so the server can do
  // something with it.
  protected ProcessMessage(aMsg: IntifaceProtocols.IntifaceFrontendMessage) {
    this.emit("message", aMsg);
  }
}
