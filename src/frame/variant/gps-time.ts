import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class GPSTime {
  constructor(
    /** uint16 */
    public year: number = 2000,
    /** uint8 */
    public month: number = 1,
    /** uint8 */
    public day: number = 1,
    /** uint8 */
    public hour: number = 0,
    /** uint8 */
    public minute: number = 0,
    /** uint8 */
    public second: number = 0,
    /** uint16 */
    public millisecond: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // year uint16
      1 + // month uint8
      1 + // day uint8
      1 + // hour uint8
      1 + // minute uint8
      1 + // second uint8
      2 // millisecond uint16
    );
  }

  get frameType() {
    return FRAME_TYPE.GPS_TIME;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(GPSTime.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint16(offset, this.year);
    offset += 2;
    payloadView.setUint8(offset, this.month);
    offset += 1;
    payloadView.setUint8(offset, this.day);
    offset += 1;
    payloadView.setUint8(offset, this.hour);
    offset += 1;
    payloadView.setUint8(offset, this.minute);
    offset += 1;
    payloadView.setUint8(offset, this.second);
    offset += 1;
    payloadView.setUint16(offset, this.millisecond);
    offset += 2;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): GPSTime | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.GPS_TIME)
      throw new Error(`Invalid frame type for GPSTime: ${frame.type.toString(16)}`);

    if (frame.payload.length < GPSTime.payloadSize) return UnsupportedOrInvalid.fromFrame(frame);

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const year = payloadView.getUint16(offset);
    offset += 2;
    const month = payloadView.getUint8(offset);
    offset += 1;
    const day = payloadView.getUint8(offset);
    offset += 1;
    const hour = payloadView.getUint8(offset);
    offset += 1;
    const minute = payloadView.getUint8(offset);
    offset += 1;
    const second = payloadView.getUint8(offset);
    offset += 1;
    const millisecond = payloadView.getUint16(offset);
    offset += 2;

    return new GPSTime(year, month, day, hour, minute, second, millisecond, frame.syncByte);
  }
}
