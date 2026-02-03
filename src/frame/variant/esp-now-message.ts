import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class EspNowMessage {
  constructor(
    /** uint8 - Used for Seat Position of the Pilot */
    public val1: number = 0,
    /** uint8 - Used for the Current Pilots Lap */
    public val2: number = 0,
    /** 15 characters for the lap time current/split */
    public val3: string = "",
    /** 15 characters for the lap time current/split */
    public val4: string = "",
    /** Free text of 20 character at the bottom of the screen */
    public freeText: string = "",
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      1 + // val1 uint8
      1 + // val2 uint8
      15 + // val3 string
      15 + // val4 string
      20 // freeText string
    );
  }

  get frameType() {
    return FRAME_TYPE.ESP_NOW_MESSAGE;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(EspNowMessage.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.val1);
    offset += 1;
    payloadView.setUint8(offset, this.val2);
    offset += 1;

    const val3Bytes = new TextEncoder().encode(this.val3);
    payload.set(val3Bytes.slice(0, 15), offset);
    offset += 15;

    const val4Bytes = new TextEncoder().encode(this.val4);
    payload.set(val4Bytes.slice(0, 15), offset);
    offset += 15;

    const freeTextBytes = new TextEncoder().encode(this.freeText);
    payload.set(freeTextBytes.slice(0, 20), offset);
    offset += 20;

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): EspNowMessage | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.ESP_NOW_MESSAGE) {
      throw new Error(`Invalid frame type for EspNowMessage: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < EspNowMessage.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const val1 = payloadView.getUint8(offset);
    offset += 1;
    const val2 = payloadView.getUint8(offset);
    offset += 1;

    const val3Bytes = frame.payload.slice(offset, offset + 15);
    const val3 = new TextDecoder().decode(val3Bytes).replace(/\0.*$/g, "");
    offset += 15;

    const val4Bytes = frame.payload.slice(offset, offset + 15);
    const val4 = new TextDecoder().decode(val4Bytes).replace(/\0.*$/g, "");
    offset += 15;

    const freeTextBytes = frame.payload.slice(offset, offset + 20);
    const freeText = new TextDecoder().decode(freeTextBytes).replace(/\0.*$/g, "");
    offset += 20;

    return new EspNowMessage(val1, val2, val3, val4, freeText, frame.syncByte);
  }
}
