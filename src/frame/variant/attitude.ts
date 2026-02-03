import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Attitude {
  constructor(
    /** int16 - Pitch angle (LSB = 100 µrad) */
    public pitch: number = 0,
    /** int16 - Roll angle (LSB = 100 µrad) */
    public roll: number = 0,
    /** int16 - Yaw angle (LSB = 100 µrad) */
    public yaw: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // pitch int16
      2 + // roll int16
      2 // yaw int16
    );
  }

  get frameType() {
    return FRAME_TYPE.ATTITUDE;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Attitude.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt16(offset, this.pitch);
    offset += 2;
    payloadView.setInt16(offset, this.roll);
    offset += 2;
    payloadView.setInt16(offset, this.yaw);
    offset += 2;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Attitude | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.ATTITUDE) {
      throw new Error(`Invalid frame type for Attitude: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Attitude.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    const pitch = payloadView.getInt16(0);
    const roll = payloadView.getInt16(2);
    const yaw = payloadView.getInt16(4);

    return new Attitude(pitch, roll, yaw, frame.syncByte);
  }
}
