import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import type { AnyNumber } from "../../types";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";

@staticImplements<InternalCrossfireFrameVariant>()
export class UnsupportedOrInvalid {
  #frameType: AnyNumber;
  #buffer: Uint8Array;

  constructor(
    frameType: number = FRAME_TYPE.UNSUPPORTED_OR_INVALID,
    buffer: Uint8Array = new Uint8Array(0),
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    this.#frameType = frameType;
    this.#buffer = buffer;
  }

  static get payloadSize() {
    return 0;
  }

  get frameType() {
    return this.#frameType as (typeof FRAME_TYPE)["UNSUPPORTED_OR_INVALID"];
  }

  get crossfireFrame(): CrossfireFrame {
    return new CrossfireFrame(this.syncByte, this.#frameType, this.#buffer);
  }

  static fromFrame(frame: CrossfireFrame): UnsupportedOrInvalid {
    return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
  }
}
