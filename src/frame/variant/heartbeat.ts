import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class Heartbeat {
  constructor(
    /** int16 - Origin Device address */
    public originAddress: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 2; // originAddress int16
  }

  get frameType() {
    return FRAME_TYPE.HEARTBEAT;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Heartbeat.payloadSize);
    const payloadView = new DataView(payload.buffer);
    payloadView.setInt16(0, this.originAddress);

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): Heartbeat | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.HEARTBEAT) {
      throw new Error(`Invalid frame type for Heartbeat: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < Heartbeat.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    const originAddress = payloadView.getInt16(0);

    return new Heartbeat(originAddress, frame.syncByte);
  }
}
