import * as ws from "ws";
import * as https from "https";
import * as http from "http";
import * as winston from "winston";
import { IntifaceConfiguration } from "./IntifaceConfiguration";
import { EventEmitter } from "events";
import { IntifaceBackendLogger } from "./IntifaceBackendLogger";
import { CertManager } from "./CertManager";
import { IntifaceUtils } from "./Utils";

export class ProxyServer extends EventEmitter {

  private _config: IntifaceConfiguration;
  private _logger: winston.Logger;
  private _wsServerProxy: ws.Server | null = null;
  private _wsClientSecureProxy: ws.Server | null = null;
  private _wsClientInsecureProxy: ws.Server | null = null;

  public constructor(aConfiguration: IntifaceConfiguration) {
    super();
    this._config = aConfiguration;
    this._logger = IntifaceBackendLogger.GetChildLogger(this.constructor.name);
  }

  public async StartProxy() {
    this._logger.info("Starting proxy server");
    const cg = new CertManager(IntifaceUtils.UserConfigDirectory);
    if (!(await cg.HasGeneratedCerts())) {
      throw new Error("No security certificates available.");
    }
    const certs = await cg.LoadCerts();
    let serverProxyClient: ws;
    let clientProxyClient: ws;

    const serverProxy = https.createServer({
      cert: certs.cert,
      key: certs.privkey,
    }).listen(this._config.ProxyServerPort, "0.0.0.0");
    this._wsServerProxy = new ws.Server({
      server: serverProxy,
    });
    this._wsServerProxy.on("connection", (client) =>  {
      this._logger.info("Proxy server connected");
      serverProxyClient = client;
      serverProxyClient.on("message", async (message) => {
        clientProxyClient.send(message);
      });
    });

    if (this._config.UseWebsocketServerInsecure) {
      this._logger.info("Creating insecure client proxy server");
      const clientInsecureProxy = http.createServer().listen(this._config.WebsocketServerInsecurePort, "0.0.0.0");
      this._wsClientInsecureProxy = new ws.Server({
        server: clientInsecureProxy,
      });
      this._wsClientInsecureProxy.on("connection", (client) => {
        this._logger.info("Proxy client connected on insecure port");
        clientProxyClient = client;
        clientProxyClient.on("message", async (message) => {
          serverProxyClient.send(message);
        });
      });
    }

    if (this._config.UseWebsocketServerSecure) {
      this._logger.info("Creating secure client proxy server");
      const clientSecureProxy = https.createServer({
        cert: certs.cert,
        key: certs.privkey,
      }).listen(this._config.WebsocketServerSecurePort, "0.0.0.0");
      this._wsClientSecureProxy = new ws.Server({
        server: clientSecureProxy,
      });
      this._wsClientSecureProxy!.on("connection", (client) => {
        this._logger.info("Proxy client connected on secure port");
        clientProxyClient = client;
        clientProxyClient.on("message", async (message) => {
          serverProxyClient.send(message);
        });
      });
    }

  }

  public StopProxy() {
    if (this._wsServerProxy !== null) {
      this._wsServerProxy.close();
    }
    if (this._wsClientSecureProxy !== null) {
      this._wsClientSecureProxy.close();
    }
    if (this._wsClientInsecureProxy !== null) {
      this._wsClientInsecureProxy.close();
    }
  }

  public get IsProxyRunning(): boolean {
    return this._wsServerProxy !== null;
  }

  public get ServerConnected(): boolean {
    return false; //this._wsClientSecureProxy !== null;
  }

  public get ClientConnected(): boolean {
    return false; //this._wsClientSecureProxy !== null;
  }
}
