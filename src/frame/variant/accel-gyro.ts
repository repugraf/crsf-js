import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class AccelGyro {
  constructor(
    /** uint32 - Timestamp of the sample in us */
    public sampleTime: number = 0,
    /** int16 - SB = INT16_MAX/2000 DPS */
    public gyroX: number = 0,
    /** int16 - SB = INT16_MAX/2000 DPS */
    public gyroY: number = 0,
    /** int16 - SB = INT16_MAX/2000 DPS */
    public gyroZ: number = 0,
    /** int16 - LSB = INT16_MAX/16 G */
    public accX: number = 0,
    /** int16 - LSB = INT16_MAX/16 G */
    public accY: number = 0,
    /** int16 - LSB = INT16_MAX/16 G */
    public accZ: number = 0,
    /** int16 - centidegrees */
    public gyroTemp: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      4 + // sampleTime uint32
      2 + // gyroX int16
      2 + // gyroY int16
      2 + // gyroZ int16
      2 + // accX int16
      2 + // accY int16
      2 + // accZ int16
      2 // gyroTemp int16
    );
  }

  get frameType() {
    return FRAME_TYPE.ACCEL_GYRO;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(AccelGyro.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint32(offset, this.sampleTime);
    offset += 4;
    payloadView.setInt16(offset, this.gyroX);
    offset += 2;
    payloadView.setInt16(offset, this.gyroY);
    offset += 2;
    payloadView.setInt16(offset, this.gyroZ);
    offset += 2;
    payloadView.setInt16(offset, this.accX);
    offset += 2;
    payloadView.setInt16(offset, this.accY);
    offset += 2;
    payloadView.setInt16(offset, this.accZ);
    offset += 2;
    payloadView.setInt16(offset, this.gyroTemp);
    offset += 2;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): AccelGyro | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.ACCEL_GYRO) {
      throw new Error(`Invalid frame type for AccelGyro: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < AccelGyro.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );
    let offset = 0;
    const sampleTime = payloadView.getUint32(offset);
    offset += 4;
    const gyroX = payloadView.getInt16(offset);
    offset += 2;
    const gyroY = payloadView.getInt16(offset);
    offset += 2;
    const gyroZ = payloadView.getInt16(offset);
    offset += 2;
    const accX = payloadView.getInt16(offset);
    offset += 2;
    const accY = payloadView.getInt16(offset);
    offset += 2;
    const accZ = payloadView.getInt16(offset);
    offset += 2;
    const gyroTemp = payloadView.getInt16(offset);
    offset += 2;

    return new AccelGyro(
      sampleTime,
      gyroX,
      gyroY,
      gyroZ,
      accX,
      accY,
      accZ,
      gyroTemp,
      frame.syncByte
    );
  }
}
