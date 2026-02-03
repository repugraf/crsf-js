import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Airspeed {
  constructor(
    /** uint16 - Airspeed in 0.1 * km/h (hectometers/h) */
    public speed: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 2; // speed uint16
  }

  get frameType() {
    return FRAME_TYPE.AIRSPEED;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Airspeed.payloadSize);
    const payloadView = new DataView(payload.buffer);
    payloadView.setUint16(0, this.speed);

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): Airspeed | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.AIRSPEED) {
      throw new Error(`Invalid frame type for Airspeed: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Airspeed.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    const speed = payloadView.getUint16(0);

    return new Airspeed(speed, frame.syncByte);
  }
}
