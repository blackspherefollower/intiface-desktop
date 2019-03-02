import Vue from "vue";
import { IntifaceProtocols } from "intiface-protocols";
import { Component, Watch, Prop } from "vue-property-decorator";
import { FrontendConnector } from "./utils/FrontendConnector";

@Component({
  components: {
  },
})
export default class App extends Vue {
  private _connector: FrontendConnector | null = null;
  private menuList = [
    { title: "Server", icon: "cloud_circle", path: "server" },
    { title: "Proxy", icon: "settings_cell", path: "proxy" },
    { title: "Devices", icon: "device_hub", path: "devices" },
    { title: "Settings", icon: "settings", path: "settings" },
    { title: "About", icon: "info", path: "about" },
  ];
  private currentItem = this.menuList[0];
  private mini = true;
  private drawer = true;

  /////////////////////////////////////
  // Component and UI methods
  /////////////////////////////////////

  public async mounted() {
    // IMPORTANT NOTE
    //
    // WEBPACK_ELECTRON is a webpack define plugin definition. Treat this
    // if/else block as you would a #ifdef/#else in C.
    if (WEBPACK_ELECTRON) {
      const mod = await import("./utils/ElectronFrontendConnector");
      this._connector = new mod.ElectronFrontendConnector();
    } else {
      if (this.$route.query["websocket"]) {
        const mod = await import("./utils/WebsocketFrontendConnector");
        this._connector = new mod.WebsocketFrontendConnector();
      } else {
        // TODO Create dummy/test connector for instances where we don"t have a
        // websocket to connect to.
        console.log("NO CONNECTOR");
      }
    }
  }

  public sendMessage() {
    if (this._connector === null) {
      return;
    }
    const msg = new IntifaceProtocols.ServerFrontendMessage();
    msg.startprocess = new IntifaceProtocols.ServerFrontendMessage.StartProcess();
    this._connector.SendMessage(msg);
  }
}
