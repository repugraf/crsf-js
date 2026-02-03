import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import {
  getUint24BE,
  setUint24BE,
  staticImplements,
  type InternalCrossfireFrameVariant,
} from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class BatterySensor {
  constructor(
    /** int16 - Voltage (LSB = 10 µV) */
    public voltage: number = 0,
    /** int16 - Current (LSB = 10 µA) */
    public current: number = 0,
    /** uint24 - Capacity used (mAh) */
    public capacityUsed: number = 0,
    /** uint8 - Battery remaining (percent) */
    public remaining: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // voltage int16
      2 + // current int16
      3 + // capacityUsed uint24
      1 // remaining uint8
    );
  }

  get frameType() {
    return FRAME_TYPE.BATTERY_SENSOR;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(BatterySensor.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt16(offset, this.voltage);
    offset += 2;
    payloadView.setInt16(offset, this.current);
    offset += 2;

    setUint24BE(payloadView, offset, this.capacityUsed);
    offset += 3;

    payloadView.setUint8(offset, this.remaining);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): BatterySensor | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.BATTERY_SENSOR) {
      throw new Error(`Invalid frame type for BatterySensor: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < BatterySensor.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const voltage = payloadView.getInt16(offset);
    offset += 2;
    const current = payloadView.getInt16(offset);
    offset += 2;

    const capacityUsed = getUint24BE(payloadView, offset);
    offset += 3;

    const remaining = payloadView.getUint8(offset);
    offset += 1;

    return new BatterySensor(voltage, current, capacityUsed, remaining, frame.syncByte);
  }
}
