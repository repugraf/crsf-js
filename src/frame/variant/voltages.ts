import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Voltages {
  constructor(
    /** uint8 - source of the voltages */
    public sourceId: number = 0,
    /** uint16[] - up to 29 voltages in millivolts (e.g. 3.850V = 3850) */
    public voltages: number[] = new Array(29).fill(0),
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    if (this.voltages.length !== 29) {
      throw new Error("voltages must have exactly 29 elements");
    }
  }

  static get payloadSize() {
    return (
      1 + // sourceId uint8
      2 * 29 // voltages uint16[]
    );
  }

  get frameType() {
    return FRAME_TYPE.VOLTAGES;
  }

  get crossfireFrame(): CrossfireFrame {
    if (this.voltages.length !== 29) throw new Error("voltages must have exactly 29 elements");

    const payload = new Uint8Array(Voltages.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.sourceId);
    offset += 1;

    for (let i = 0; i < 29; i++) {
      const voltage = this.voltages[i] || 0;
      payloadView.setUint16(offset, voltage);
      offset += 2;
    }

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Voltages | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.VOLTAGES) {
      throw new Error(`Invalid frame type for Voltages: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Voltages.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const sourceId = payloadView.getUint8(offset);
    offset += 1;

    const voltages: number[] = [];
    for (let i = 0; i < 29; i++) {
      voltages.push(payloadView.getUint16(offset));
      offset += 2;
    }

    return new Voltages(sourceId, voltages, frame.syncByte);
  }
}
