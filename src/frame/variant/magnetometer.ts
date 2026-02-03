import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Magnetometer {
  constructor(
    /** int16 - milligauss * 3 */
    public fieldX: number = 0,
    /** int16 - milligauss * 3 */
    public fieldY: number = 0,
    /** int16 - milligauss * 3 */
    public fieldZ: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // fieldX int16
      2 + // fieldY int16
      2 // fieldZ int16
    );
  }

  get frameType() {
    return FRAME_TYPE.MAGNETOMETER;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Magnetometer.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt16(offset, this.fieldX);
    offset += 2;
    payloadView.setInt16(offset, this.fieldY);
    offset += 2;
    payloadView.setInt16(offset, this.fieldZ);
    offset += 2;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Magnetometer | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.MAGNETOMETER) {
      throw new Error(`Invalid frame type for Magnetometer: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Magnetometer.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const fieldX = payloadView.getInt16(offset);
    offset += 2;
    const fieldY = payloadView.getInt16(offset);
    offset += 2;
    const fieldZ = payloadView.getInt16(offset);
    offset += 2;

    return new Magnetometer(fieldX, fieldY, fieldZ, frame.syncByte);
  }
}
