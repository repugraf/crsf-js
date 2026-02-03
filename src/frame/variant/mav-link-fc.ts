import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class MavLinkFC {
  constructor(
    /** int16 */
    public airspeed: number = 0,
    /** uint8 -  vehicle mode flags, defined in MAV_MODE_FLAG enum */
    public baseMode: number = 0,
    /** uint32 - autopilot-specific flags */
    public customMode: number = 0,
    /** uint8 - FC type; defined in MAV_AUTOPILOT enum */
    public autopilotType: number = 0,
    /** uint8 - vehicle type; defined in MAV_TYPE enum */
    public firmwareType: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      2 + // airspeed int16
      1 + // baseMode uint8
      4 + // customMode uint32
      1 + // autopilotType uint8
      1 // firmwareType uint8
    );
  }

  get frameType() {
    return FRAME_TYPE.MAV_LINK_FC;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(MavLinkFC.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setInt16(offset, this.airspeed);
    offset += 2;
    payloadView.setUint8(offset, this.baseMode);
    offset += 1;
    payloadView.setUint32(offset, this.customMode);
    offset += 4;
    payloadView.setUint8(offset, this.autopilotType);
    offset += 1;
    payloadView.setUint8(offset, this.firmwareType);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): MavLinkFC | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.MAV_LINK_FC) {
      throw new Error(`Invalid frame type for MavLinkFC: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < MavLinkFC.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const airspeed = payloadView.getInt16(offset);
    offset += 2;
    const baseMode = payloadView.getUint8(offset);
    offset += 1;
    const customMode = payloadView.getUint32(offset);
    offset += 4;
    const autopilotType = payloadView.getUint8(offset);
    offset += 1;
    const firmwareType = payloadView.getUint8(offset);
    offset += 1;

    return new MavLinkFC(
      airspeed,
      baseMode,
      customMode,
      autopilotType,
      firmwareType,
      frame.syncByte
    );
  }
}
