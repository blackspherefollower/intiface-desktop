import Vue from "vue";
import { IntifaceConfiguration, FrontendConnector } from "intiface-core-library";
import { Component, Prop } from "vue-property-decorator";
import {config} from "@vue/test-utils";
import {IntifaceProtocols} from "intiface-protocols";

@Component({
  components: {
  },
})
export default class SimulatorPanel extends Vue {

  @Prop()
  private connector!: FrontendConnector;
  @Prop()
  private config!: IntifaceConfiguration;

  public async mounted() {
    this.connector.on("simulator_message", (d,m) => console.debug(d,m));
  }

  public async AddDevice() {
    const msg = IntifaceProtocols.ServerControlMessage.create({
      addSimulatedDevice: IntifaceProtocols.ServerControlMessage.AddSimulatedDevice.create({
        deviceIdent: "1234",
        deviceName: "test device",
        deviceMsgs: {
          StopDeviceCmd: IntifaceProtocols.DeviceMessageAttrs.create({msgsAttrs: {}}),
          VibrateCmd: IntifaceProtocols.DeviceMessageAttrs.create({msgsAttrs: {FeatureCount: "2"}}),
          SingleMotorVibrateCmd: IntifaceProtocols.DeviceMessageAttrs.create({msgsAttrs: {}}),
        },
      }),
    });
    console.debug(msg.toJSON())
    this.connector.SendServerControlMessgae(msg);
  }

}
