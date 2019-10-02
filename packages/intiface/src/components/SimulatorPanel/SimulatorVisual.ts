import Vue from "vue";
import {Component, Prop, Watch} from "vue-property-decorator";
import {FleshlightHelper} from "@/components/SimulatorPanel/FleshLightHelper";

@Component({
  components: {
  },
})
export default class SimulatorPanel extends Vue {
  @Prop()
  public type!: string;
  @Prop()
  public index!: number;
  @Prop()
  public value!: number;
  @Prop({default: Date.now()})
  public time!: number;
  @Prop({default: true})
  public clockwise!: boolean;

  public sliderValue: number = 0;
  public sliderTarget: number = 0;
  public minValue: number = 0;
  public lastTime: number = Date.now();
  public targetTime: number = Date.now();
  public sliderSpeed: number = 1;
  public linearTimeout: any = undefined;

  @Watch("time")
  @Watch("value")
  @Watch("clockwise")
  private onPropertyChanged(newV: number, oldV: number) {
    const targetValue = this.value > 100 ? 100 : this.value < 0 ? 0 : this.value;
    if (this.type === "rotator") {
      this.minValue = -100;
      this.sliderValue = targetValue * (this.clockwise ? 1 : -1);
    } else if (this.type === "linear") {
      const distance = Math.abs(this.sliderValue - targetValue);
      const duration = Date.now() - this.time;
      if (this.targetTime !== this.time || targetValue !== this.sliderTarget) {
        clearTimeout(this.linearTimeout);
        this.sliderSpeed = FleshlightHelper.GetSpeed(distance / 100, duration);
        this.targetTime = this.time;
        this.sliderTarget = targetValue;
        this.lastTime = Date.now();
        this.updatePosition();
      }
    } else {
      this.sliderValue = targetValue;
    }
  }

  private updatePosition() {
    const targetValue = this.value > 100 ? 100 : this.value < 0 ? 0 : this.value;
    const newTime = Date.now();
    const diff = FleshlightHelper.GetDistance(newTime - this.lastTime, this.sliderSpeed);
    const direction = this.sliderValue <= targetValue ? 1 : -1;
    let newVal = this.sliderValue + (diff * direction * 1000);
    this.lastTime = newTime;
    if (this.sliderValue <= targetValue && newVal > targetValue ||
      this.sliderValue >= targetValue && newVal < targetValue ) {
      newVal = targetValue;
    }
    this.sliderValue = newVal;
    if (this.sliderValue !== targetValue ) {
      this.linearTimeout = setTimeout(() => this.updatePosition(), 50);
    }
  }

  private beforeDestroy() {
    clearTimeout(this.linearTimeout);
  }
}
