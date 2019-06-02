import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { IntifaceConfiguration, FrontendConnector } from "intiface-core-library";

@Component({
  components: {
  },
})
export default class ProxyPanel extends Vue {

  @Prop()
  private config!: IntifaceConfiguration;

  @Prop()
  private connector!: FrontendConnector;
  private _isRunning: boolean = false;

  public async ToggleProxy() {
    if (!this._isRunning) {
      await this.connector.StartProxy();
    } else {
      await this.connector.StopProxy();
    }
    this._isRunning = !this._isRunning;
  }

  public get IsRunning(): boolean {
    return this._isRunning;
  }
}
