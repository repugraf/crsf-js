import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Temp {
  constructor(
    /** uint8 - source of the temperature data (e.g., 0 = FC including all ESCs, 1 = Ambient, etc.) */
    public tempSourceId: number = 0,
    /** int16[] - up to 20 temperature values in deci-degree (tenths of a degree) Celsius (e.g., 250 = 25.0°C, -50 = -5.0°C) */
    public temperatures: number[] = new Array(20).fill(0),
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    if (this.temperatures.length !== 20) {
      throw new Error("temperatures must have exactly 20 elements");
    }
  }

  static get payloadSize() {
    return (
      1 + // tempSourceId uint8
      2 * 20 // temperatures int16[]
    );
  }

  get frameType() {
    return FRAME_TYPE.TEMP;
  }

  get crossfireFrame(): CrossfireFrame {
    if (this.temperatures.length !== 20) {
      throw new Error("temperatures must have exactly 20 elements");
    }

    const payload = new Uint8Array(Temp.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.tempSourceId);
    offset += 1;

    for (const tempValue of this.temperatures) {
      payloadView.setInt16(offset, tempValue);
      offset += 2;
    }

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Temp | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.TEMP) {
      throw new Error(`Invalid frame type for Temp: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Temp.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const tempSourceId = payloadView.getUint8(offset);
    offset += 1;

    const temperatures: number[] = new Array(20).fill(0);
    for (let i = 0; i < 20; i++) {
      temperatures[i] = payloadView.getInt16(offset);
      offset += 2;
    }

    return new Temp(tempSourceId, temperatures, frame.syncByte);
  }
}
