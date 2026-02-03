import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class GPS {
  constructor(
    /** int32 - degree / 10`000`000 */
    public latitude: number = 0,
    /** int32 - degree / 10`000`000 */
    public longitude: number = 0,
    /** uint16 - km/h / 100 */
    public groundSpeed: number = 0,
    /** uint16 - degree / 100 */
    public heading: number = 0,
    /** uint16 - meter - 1000m offset */
    public altitude: number = 0,
    /** uint8 - # of sats in view */
    public satellites: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      4 + // latitude int32
      4 + // longitude int32
      2 + // groundSpeed uint16
      2 + // heading uint16
      2 + // altitude uint16
      1 // satellites uint8
    );
  }

  get frameType() {
    return FRAME_TYPE.GPS;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(GPS.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt32(offset, this.latitude);
    offset += 4;
    payloadView.setInt32(offset, this.longitude);
    offset += 4;
    payloadView.setUint16(offset, this.groundSpeed);
    offset += 2;
    payloadView.setUint16(offset, this.heading);
    offset += 2;
    payloadView.setUint16(offset, this.altitude);
    offset += 2;
    payloadView.setUint8(offset, this.satellites);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): GPS | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.GPS)
      throw new Error(`Invalid frame type for GPS: ${frame.type.toString(16)}`);

    if (frame.payload.length < GPS.payloadSize) return UnsupportedOrInvalid.fromFrame(frame);

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const latitude = payloadView.getInt32(offset);
    offset += 4;
    const longitude = payloadView.getInt32(offset);
    offset += 4;
    const groundSpeed = payloadView.getUint16(offset);
    offset += 2;
    const heading = payloadView.getUint16(offset);
    offset += 2;
    const altitude = payloadView.getUint16(offset);
    offset += 2;
    const satellites = payloadView.getUint8(offset);
    offset += 1;

    return new GPS(latitude, longitude, groundSpeed, heading, altitude, satellites, frame.syncByte);
  }
}
