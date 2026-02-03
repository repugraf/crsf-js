import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class GPSExtended {
  constructor(
    /** uint8 - Current GPS fix quality */
    public fixType: number = 0,
    /** int16 - Northward (north = positive) Speed [cm/sec] */
    public nSpeed: number = 0,
    /** int16 - Eastward (east = positive) Speed [cm/sec] */
    public eSpeed: number = 0,
    /** int16 - Vertical (up = positive) Speed [cm/sec] */
    public vSpeed: number = 0,
    /** int16 - Horizontal Speed accuracy cm/sec */
    public hSpeedAcc: number = 0,
    /** int16 - Heading accuracy in degrees scaled with 1e-1 degrees times 10) */
    public trackAcc: number = 0,
    /** int16 - Meters Height above GPS Ellipsoid (not MSL) */
    public altEllipsoid: number = 0,
    /** int16 - horizontal accuracy in cm */
    public hAcc: number = 0,
    /** int16 - vertical accuracy in cm */
    public vAcc: number = 0,
    /** uint8 - reserved */
    public reserved: number = 0,
    /** uint8 - horizontal dilution of precision,Dimensionless in nits of.1. */
    public hDOP: number = 0,
    /** uint8 - vertical dilution of precision, Dimensionless in nits of .1. */
    public vDOP: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      1 + // fixType uint8
      2 + // nSpeed int16
      2 + // eSpeed int16
      2 + // vSpeed int16
      2 + // hSpeedAcc int16
      2 + // trackAcc int16
      2 + // altEllipsoid int16
      2 + // hAcc int16
      2 + // vAcc int16
      1 + // reserved uint8
      1 + // hDOP uint8
      1 // vDOP uint8
    );
  }

  get frameType() {
    return FRAME_TYPE.GPS_EXTENDED;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(GPSExtended.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.fixType);
    offset += 1;
    payloadView.setInt16(offset, this.nSpeed);
    offset += 2;
    payloadView.setInt16(offset, this.eSpeed);
    offset += 2;
    payloadView.setInt16(offset, this.vSpeed);
    offset += 2;
    payloadView.setInt16(offset, this.hSpeedAcc);
    offset += 2;
    payloadView.setInt16(offset, this.trackAcc);
    offset += 2;
    payloadView.setInt16(offset, this.altEllipsoid);
    offset += 2;
    payloadView.setInt16(offset, this.hAcc);
    offset += 2;
    payloadView.setInt16(offset, this.vAcc);
    offset += 2;
    payloadView.setUint8(offset, this.reserved);
    offset += 1;
    payloadView.setUint8(offset, this.hDOP);
    offset += 1;
    payloadView.setUint8(offset, this.vDOP);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): GPSExtended | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.GPS_EXTENDED)
      throw new Error(`Invalid frame type for GPS Extended: ${frame.type.toString(16)}`);

    if (frame.payload.length < GPSExtended.payloadSize)
      return UnsupportedOrInvalid.fromFrame(frame);

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const fixType = payloadView.getUint8(offset);
    offset += 1;
    const nSpeed = payloadView.getInt16(offset);
    offset += 2;
    const eSpeed = payloadView.getInt16(offset);
    offset += 2;
    const vSpeed = payloadView.getInt16(offset);
    offset += 2;
    const hSpeedAcc = payloadView.getInt16(offset);
    offset += 2;
    const trackAcc = payloadView.getInt16(offset);
    offset += 2;
    const altEllipsoid = payloadView.getInt16(offset);
    offset += 2;
    const hAcc = payloadView.getInt16(offset);
    offset += 2;
    const vAcc = payloadView.getInt16(offset);
    offset += 2;
    const reserved = payloadView.getUint8(offset);
    offset += 1;
    const hDOP = payloadView.getUint8(offset);
    offset += 1;
    const vDOP = payloadView.getUint8(offset);
    offset += 1;

    return new GPSExtended(
      fixType,
      nSpeed,
      eSpeed,
      vSpeed,
      hSpeedAcc,
      trackAcc,
      altEllipsoid,
      hAcc,
      vAcc,
      reserved,
      hDOP,
      vDOP,
      frame.syncByte
    );
  }
}
