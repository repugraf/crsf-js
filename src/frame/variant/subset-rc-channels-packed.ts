import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";

/** This frame is discouraged for implementation. */
@staticImplements<InternalCrossfireFrameVariant>()
export class SubsetRCChannelsPacked {
  constructor(
    public buffer: Uint8Array,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 0; // variable size
  }

  get frameType() {
    return FRAME_TYPE.SUBSET_RC_CHANNELS_PACKED;
  }

  get crossfireFrame(): CrossfireFrame {
    return new CrossfireFrame(this.syncByte, this.frameType, this.buffer);
  }

  static fromFrame(frame: CrossfireFrame): SubsetRCChannelsPacked {
    return new SubsetRCChannelsPacked(frame.payload, frame.syncByte);
  }
}
