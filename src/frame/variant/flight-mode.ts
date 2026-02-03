import { FRAME_TYPE, MAX_PAYLOAD_SIZE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import {
  decodeCString,
  encodeCString,
  staticImplements,
  type InternalCrossfireFrameVariant,
} from "../util";

const MAX_MODE_STRING_LENGTH = MAX_PAYLOAD_SIZE - 1; // minus null terminator

@staticImplements<InternalCrossfireFrameVariant>()
export class FlightMode {
  constructor(
    public mode: string,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {
    if (encodeCString(mode).length > MAX_PAYLOAD_SIZE) {
      throw new RangeError(
        `Flight mode string exceeds maximum length of ${MAX_MODE_STRING_LENGTH} characters`
      );
    }
  }

  static get payloadSize() {
    return 0; // variable
  }

  get frameType() {
    return FRAME_TYPE.FLIGHT_MODE;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = encodeCString(this.mode);

    if (payload.length > MAX_PAYLOAD_SIZE) {
      throw new RangeError(
        `Encoded flight mode string exceeds maximum payload size of ${MAX_PAYLOAD_SIZE} bytes`
      );
    }

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): FlightMode {
    if (frame.type !== FRAME_TYPE.FLIGHT_MODE) {
      throw new Error(`Invalid frame type for Flight Mode: ${frame.type.toString(16)}`);
    }

    return new FlightMode(decodeCString(frame.payload), frame.syncByte);
  }
}
