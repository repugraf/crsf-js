import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class LinkStatistics {
  constructor(
    /** uint8 - Uplink RSSI Antenna 1 (dBm * -1) */
    public puRssiAnt1: number = 0,
    /** uint8 - Uplink RSSI Antenna 2 (dBm * -1) */
    public puRssiAnt2: number = 0,
    /** uint8 - Uplink Package success rate / Link quality (%) */
    public upLinkQuality: number = 0,
    /** int8 - Uplink SNR (dB) */
    public upSnr: number = 0,
    /** uint8 - number of currently best antenna */
    public activeAntenna: number = 0,
    /** uint8 - enum {4fps = 0 , 50fps, 150fps} */
    public rfProfile: number = 0,
    /** uint8 - enum {0mW = 0, 10mW, 25mW, 100mW, 500mW, 1000mW, 2000mW, 250mW, 50mW} */
    public upRfPower: number = 0,
    /** uint8 - Downlink RSSI (dBm * -1) */
    public downRssi: number = 0,
    /** uint8 - Downlink Package success rate / Link quality (%) */
    public downLinkQuality: number = 0,
    /** int8 - Downlink SNR (dB) */
    public downSnr: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      1 + // puRssiAnt1 uint8
      1 + // puRssiAnt2 uint8
      1 + // upLinkQuality uint8
      1 + // upSnr int8
      1 + // activeAntenna uint8
      1 + // rfProfile uint8
      1 + // upRfPower uint8
      1 + // downRssi uint8
      1 + // downLinkQuality uint8
      1 // downSnr int8
    );
  }

  get frameType() {
    return FRAME_TYPE.LINK_STATISTICS;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(LinkStatistics.payloadSize);
    const payloadView = new DataView(payload.buffer);

    let offset = 0;
    payloadView.setUint8(offset, this.puRssiAnt1);
    offset += 1;
    payloadView.setUint8(offset, this.puRssiAnt2);
    offset += 1;
    payloadView.setUint8(offset, this.upLinkQuality);
    offset += 1;
    payloadView.setInt8(offset, this.upSnr);
    offset += 1;
    payloadView.setUint8(offset, this.activeAntenna);
    offset += 1;
    payloadView.setUint8(offset, this.rfProfile);
    offset += 1;
    payloadView.setUint8(offset, this.upRfPower);
    offset += 1;
    payloadView.setUint8(offset, this.downRssi);
    offset += 1;
    payloadView.setUint8(offset, this.downLinkQuality);
    offset += 1;
    payloadView.setInt8(offset, this.downSnr);
    offset += 1;

    return new CrossfireFrame(this.syncByte, this.frameType, new Uint8Array(payloadView.buffer));
  }

  static fromFrame(frame: CrossfireFrame): LinkStatistics | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.LINK_STATISTICS) {
      throw new Error(`Invalid frame type for LinkStatistics: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < LinkStatistics.payloadSize) {
      return UnsupportedOrInvalid.fromFrame(frame);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const puRssiAnt1 = payloadView.getUint8(offset);
    offset += 1;
    const puRssiAnt2 = payloadView.getUint8(offset);
    offset += 1;
    const upLinkQuality = payloadView.getUint8(offset);
    offset += 1;
    const upSnr = payloadView.getInt8(offset);
    offset += 1;
    const activeAntenna = payloadView.getUint8(offset);
    offset += 1;
    const rfProfile = payloadView.getUint8(offset);
    offset += 1;
    const upRfPower = payloadView.getUint8(offset);
    offset += 1;
    const downRssi = payloadView.getUint8(offset);
    offset += 1;
    const downLinkQuality = payloadView.getUint8(offset);
    offset += 1;
    const downSnr = payloadView.getInt8(offset);
    offset += 1;

    return new LinkStatistics(
      puRssiAnt1,
      puRssiAnt2,
      upLinkQuality,
      upSnr,
      activeAntenna,
      rfProfile,
      upRfPower,
      downRssi,
      downLinkQuality,
      downSnr,
      frame.syncByte
    );
  }
}
