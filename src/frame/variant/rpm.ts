import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import {
  getInt24BE,
  setInt24BE,
  staticImplements,
  type InternalCrossfireFrameVariant,
} from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class RMP {
  constructor(
    /** uint8 - Identifies the source of the RPM data (e.g., 0 = Motor 1, 1 = Motor 2, etc.) */
    public rpmSourceId: number = 0,
    /** int24[] - 1 - 19 RPM values with negative ones representing the motor spinning in reverse */
    public rpmValues: number[] = new Array(19).fill(0),
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    if (this.rpmValues.length !== 19) {
      throw new Error("rpmValues must have exactly 19 elements");
    }
  }

  static get payloadSize() {
    return (
      1 + // rpmSourceId uint8
      3 * 19 // rpmValues int24[]
    );
  }

  get frameType() {
    return FRAME_TYPE.RPM;
  }

  get crossfireFrame(): CrossfireFrame {
    if (this.rpmValues.length !== 19) {
      throw new Error("rpmValues must have exactly 19 elements");
    }

    const payload = new Uint8Array(RMP.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.rpmSourceId);
    offset += 1;

    for (const rpmValue of this.rpmValues) {
      setInt24BE(payloadView, offset, rpmValue);
      offset += 3;
    }

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): RMP | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.RPM) {
      throw new Error(`Invalid frame type for RMP: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < RMP.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const rpmSourceId = payloadView.getUint8(offset);
    offset += 1;

    const rpmValues: number[] = new Array(19).fill(0);
    for (let i = 0; i < 19; i++) {
      const rpmValue = getInt24BE(payloadView, offset);
      rpmValues[i] = rpmValue;
      offset += 3;
    }

    return new RMP(rpmSourceId, rpmValues, frame.syncByte);
  }
}
