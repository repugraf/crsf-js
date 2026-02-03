import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

@staticImplements<InternalCrossfireFrameVariant>()
export class LinkStatisticsRx {
  constructor(
    /** uint8 - RSSI (dBm * -1) */
    public rssiDb: number = 0,
    /** uint8 - RSSI in percent */
    public rssiPercent: number = 0,
    /** uint8 - Package success rate / Link quality (%) */
    public linkQuality: number = 0,
    /** int8 - SNR (dB) */
    public snr: number = 0,
    /** uint8 - rf power in dBm */
    public rfPowerDb: number = 0,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return (
      1 + // rssiDb
      1 + // rssiPercent
      1 + // linkQuality
      1 + // snr
      1 // rfPowerDb
    );
  }

  get frameType() {
    return FRAME_TYPE.LINK_STATISTICS_RX;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(LinkStatisticsRx.payloadSize);
    const payloadView = new DataView(payload.buffer);

    payloadView.setUint8(0, this.rssiDb);
    payloadView.setUint8(1, this.rssiPercent);
    payloadView.setUint8(2, this.linkQuality);
    payloadView.setInt8(3, this.snr);
    payloadView.setUint8(4, this.rfPowerDb);

    return new CrossfireFrame(
      this.syncByte,
      FRAME_TYPE.LINK_STATISTICS_RX,
      new Uint8Array(payloadView.buffer)
    );
  }

  static fromFrame(frame: CrossfireFrame): LinkStatisticsRx | UnsupportedOrInvalid {
    if (frame.payload.length !== LinkStatisticsRx.payloadSize) {
      throw new Error(`Invalid payload size for LinkStatisticsRx: ${frame.payload.length}`);
    }

    if (frame.payload.length < LinkStatisticsRx.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const payloadView = new DataView(
      frame.payload.buffer,
      frame.payload.byteOffset,
      frame.payload.byteLength
    );

    let offset = 0;
    const rssiDb = payloadView.getUint8(offset);
    offset += 1;
    const rssiPercent = payloadView.getUint8(offset);
    offset += 1;
    const linkQuality = payloadView.getUint8(offset);
    offset += 1;
    const snr = payloadView.getInt8(offset);
    offset += 1;
    const rfPowerDb = payloadView.getUint8(offset);
    offset += 1;

    return new LinkStatisticsRx(rssiDb, rssiPercent, linkQuality, snr, rfPowerDb, frame.syncByte);
  }
}
