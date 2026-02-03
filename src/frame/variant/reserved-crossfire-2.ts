import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";

/** This frame is reserved for future Crossfire implementations and should not be used. */
@staticImplements<InternalCrossfireFrameVariant>()
export class ReservedCrossfire2 {
  #buffer: Uint8Array;

  constructor(
    buffer: Uint8Array = new Uint8Array(0),
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    this.#buffer = buffer;
  }

  static get payloadSize() {
    return 0; // unknown size
  }

  get frameType() {
    return FRAME_TYPE.RESERVED_CROSSFIRE_2;
  }

  get crossfireFrame(): CrossfireFrame {
    return new CrossfireFrame(this.syncByte, FRAME_TYPE.RESERVED_CROSSFIRE_2, this.#buffer);
  }

  static fromFrame(frame: CrossfireFrame): ReservedCrossfire2 {
    if (frame.type !== FRAME_TYPE.RESERVED_CROSSFIRE_2) {
      throw new Error(`Invalid frame type for ReservedCrossfire2: ${frame.type.toString(16)}`);
    }

    return new ReservedCrossfire2(frame.payload, frame.syncByte);
  }
}
