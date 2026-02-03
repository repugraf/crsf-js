import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class VTXTelemetry {
  constructor(
    /** uint8 */
    public originAddress: number = 0,
    /** uint8 - VTX power in dBm */
    public powerDbm: number = 0,
    /** uint16 - VTX frequency in MHz */
    public frequencyMhz: number = 0,
    /** uint8 - 0=Off, 1=On */
    public pitMode: number = 1,
    /** uint8 - 0=Off, 1=On, 2=Switch, 3=Failsafe */
    public pitModeControl: number = 2,
    /** uint8 - 0=Ch5, 1=Ch5 Inv, … , 15=Ch12 Inv */
    public pitModeSwitch: number = 4,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      1 + // originAddress uint8
      1 + // powerDbm uint8
      2 + // frequencyMhz uint16
      1 + // pitMode uint8
      1 + // pitModeControl uint8
      1 // pitModeSwitch uint8
    );
  }

  get frameType() {
    return FRAME_TYPE.VTX_TELEMETRY;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(VTXTelemetry.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.originAddress);
    offset += 1;
    payloadView.setUint8(offset, this.powerDbm);
    offset += 1;
    payloadView.setUint16(offset, this.frequencyMhz);
    offset += 2;
    payloadView.setUint8(offset, this.pitMode);
    offset += 1;
    payloadView.setUint8(offset, this.pitModeControl);
    offset += 1;
    payloadView.setUint8(offset, this.pitModeSwitch);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): VTXTelemetry | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.VTX_TELEMETRY) {
      throw new Error(`Invalid frame type for VTXTelemetry: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < VTXTelemetry.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const originAddress = payloadView.getUint8(offset);
    offset += 1;
    const powerDbm = payloadView.getUint8(offset);
    offset += 1;
    const frequencyMhz = payloadView.getUint16(offset);
    offset += 2;
    const pitMode = payloadView.getUint8(offset);
    offset += 1;
    const pitModeControl = payloadView.getUint8(offset);
    offset += 1;
    const pitModeSwitch = payloadView.getUint8(offset);
    offset += 1;

    return new VTXTelemetry(
      originAddress,
      powerDbm,
      frequencyMhz,
      pitMode,
      pitModeControl,
      pitModeSwitch,
      frame.syncByte
    );
  }
}
