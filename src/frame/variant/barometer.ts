import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Barometer {
  constructor(
    /** int32 - Pascals */
    public pressurePa: number = 0,
    /** int32 - centidegrees */
    public baroTemp: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      4 + // pressurePa int32
      4 // baroTemp int32
    );
  }

  get frameType() {
    return FRAME_TYPE.BAROMETER;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Barometer.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt32(offset, this.pressurePa);
    offset += 4;
    payloadView.setInt32(offset, this.baroTemp);
    offset += 4;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Barometer | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.BAROMETER) {
      throw new Error(`Invalid frame type for Barometer: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Barometer.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const pressurePa = payloadView.getInt32(offset);
    offset += 4;
    const baroTemp = payloadView.getInt32(offset);
    offset += 4;

    return new Barometer(pressurePa, baroTemp, frame.syncByte);
  }
}
