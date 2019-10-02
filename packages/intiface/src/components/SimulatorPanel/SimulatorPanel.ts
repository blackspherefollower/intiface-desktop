import Vue from "vue";
import { IntifaceConfiguration, FrontendConnector } from "intiface-core-library";
import { Component, Prop } from "vue-property-decorator";
import {config} from "@vue/test-utils";
import {IntifaceProtocols} from "intiface-protocols";
import SimulatorVisual from "./SimulatorVisual.vue";

@Component({
  components: {
    SimulatorVisual,
  },
})
export default class SimulatorPanel extends Vue {

  @Prop()
  private connector!: FrontendConnector;
  @Prop()
  private config!: IntifaceConfiguration;

  private controls = [
    {type: "vibrator", index: 0, value: 0},
    {type: "vibrator", index: 1, value: 0},
    {type: "linear", index: 0, value: 0, time: Date.now()},
    {type: "rotator", index: 0, value: 0, clockwise: true},
  ];

  public async mounted() {
    this.connector.on("simulator_message", this.UpdateValues);
  }

  private UpdateValues(d, m) {
    // TODO: match up device with simulated device
    const msgs = JSON.parse(m);
    // @ts-ignore
    msgs.forEach((msg) => {
      if (msg.hasOwnProperty("VibrateCmd") &&
        msg.VibrateCmd.hasOwnProperty("Speeds") &&
        msg.VibrateCmd.Speeds instanceof Array) {
        // @ts-ignore
        msg.VibrateCmd.Speeds.forEach((s) => {
          this.controls.forEach((c) => {
            if (c.type === "vibrator" && c.index === s.Index) {
              c.value = s.Speed * 100;
            }
          });
        });
      } else if (msg.hasOwnProperty("SingleMotorVibrateCmd") &&
        msg.SingleMotorVibrateCmd.hasOwnProperty("Speed")) {
        this.controls.forEach((c) => {
          if (c.type === "vibrator") {
            c.value = msg.SingleMotorVibrateCmd.Speed * 100;
          }
        });
      } else if (msg.hasOwnProperty("LinearCmd") &&
        msg.LinearCmd.hasOwnProperty("Vectors") &&
        msg.LinearCmd.Vectors instanceof Array) {
        // @ts-ignore
        msg.LinearCmd.Vectors.forEach((s) => {
          this.controls.forEach((c) => {
            if (c.type === "linear" && c.index === s.Index) {
              c.value = s.Position * 100;
              c.time = s.Duration + Date.now();
            }
          });
        });
      } else if (msg.hasOwnProperty("RotateCmd") &&
        msg.RotateCmd.hasOwnProperty("Rotations") &&
        msg.RotateCmd.Rotations instanceof Array) {
        // @ts-ignore
        msg.RotateCmd.Rotations.forEach((s) => {
          this.controls.forEach((c) => {
            if (c.type === "rotator" && c.index === s.Index) {
              c.value = s.Speed * 100;
              c.clockwise = s.Clockwise;
            }
          });
        });
      }
    });
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
          RotateCmd: IntifaceProtocols.DeviceMessageAttrs.create({msgsAttrs: {FeatureCount: "1"}}),
          LinearCmd: IntifaceProtocols.DeviceMessageAttrs.create({msgsAttrs: {FeatureCount: "1"}}),
        },
      }),
    });
    this.connector.SendServerControlMessgae(msg);
  }

  public async RemoveDevice() {
    const msg = IntifaceProtocols.ServerControlMessage.create({
      removeSimulatedDevice: IntifaceProtocols.ServerControlMessage.RemoveSimulatedDevice.create({
        deviceIdent: "1234",
      }),
    });
    this.connector.SendServerControlMessgae(msg);
  }

}
