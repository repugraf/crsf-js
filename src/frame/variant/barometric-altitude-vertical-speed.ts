import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class BarometricAltitudeVerticalSpeed {
  constructor(
    /** uint16 - Altitude above start (calibration) point */
    public altitudePacked: number = 0,
    /** int8 - vertical speed */
    public verticalSpeedPacked: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // altitudePacked uint16
      1 // verticalSpeedPacked int8
    );
  }

  get frameType() {
    return FRAME_TYPE.BAROMETRIC_ALTITUDE_VERTICAL_SPEED;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(BarometricAltitudeVerticalSpeed.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint16(offset, this.altitudePacked);
    offset += 2;
    payloadView.setInt8(offset, this.verticalSpeedPacked);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): BarometricAltitudeVerticalSpeed | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.BAROMETRIC_ALTITUDE_VERTICAL_SPEED) {
      throw new Error(
        `Invalid frame type for BarometricAltitudeVerticalSpeed: ${frame.type.toString(16)}`
      );
    }

    if (frame.payload.length < BarometricAltitudeVerticalSpeed.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const altitudePacked = payloadView.getUint16(offset);
    offset += 2;
    const verticalSpeedPacked = payloadView.getInt8(offset);
    offset += 1;

    return new BarometricAltitudeVerticalSpeed(altitudePacked, verticalSpeedPacked, frame.syncByte);
  }
}
