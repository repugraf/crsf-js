import { SERIAL_SYNC_BYTE } from "../constants";
import { getCRC } from "../crc";

export class CrossfireFrame {
  constructor(
    public syncByte: number = SERIAL_SYNC_BYTE,
    public type: number = 0,
    public payload: Uint8Array = new Uint8Array(0)
  ) {}

  /** Total frame length: type + payload + crc */
  get length(): number {
    return this.payload.length + 2;
  }

  get crc(): number {
    const crcData = new Uint8Array(1 + this.payload.length);
    crcData[0] = this.type;
    crcData.set(this.payload, 1);
    return getCRC(crcData);
  }
}
