import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";

@staticImplements<InternalCrossfireFrameVariant>()
export class Reserved {
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
    return FRAME_TYPE.RESERVED;
  }

  get crossfireFrame(): CrossfireFrame {
    return new CrossfireFrame(this.syncByte, this.frameType, this.#buffer);
  }

  static fromFrame(frame: CrossfireFrame): Reserved {
    if (frame.type !== FRAME_TYPE.RESERVED) {
      throw new Error(`Invalid frame type for Reserved: ${frame.type.toString(16)}`);
    }

    return new Reserved(frame.payload, frame.syncByte);
  }
}
