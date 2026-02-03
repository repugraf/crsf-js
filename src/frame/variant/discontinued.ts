import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";

@staticImplements<InternalCrossfireFrameVariant>()
export class Discontinued {
  constructor(public syncByte: number = SERIAL_SYNC_BYTE) {}

  static get payloadSize() {
    return 0;
  }

  get frameType() {
    return FRAME_TYPE.DISCONTINUED;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(Discontinued.payloadSize);
    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): Discontinued {
    if (frame.type !== FRAME_TYPE.DISCONTINUED) {
      throw new Error(`Invalid frame type for Di: ${frame.type.toString(16)}`);
    }

    return new Discontinued(frame.syncByte);
  }
}
