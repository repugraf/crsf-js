import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class VariometerSensor {
  constructor(
    /** int16 - Vertical speed cm/s */
    public vSpeed: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 2; // vSpeed int16
  }

  get frameType() {
    return FRAME_TYPE.VARIOMETER_SENSOR;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(VariometerSensor.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt16(offset, this.vSpeed);
    offset += 2;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): VariometerSensor | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.VARIOMETER_SENSOR) {
      throw new Error(`Invalid frame type for VariometerSensor: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < VariometerSensor.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    const vSpeed = payloadView.getInt16(0);

    return new VariometerSensor(vSpeed, frame.syncByte);
  }
}
