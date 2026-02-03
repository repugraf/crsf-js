// https://github.com/tbs-fpv/tbs-crsf-spec/blob/main/crsf.md
// ardupilot/libraries/AP_RCProtocol/AP_RCProtocol_CRSF.h
import { getCRC } from "./crc";
import { MAX_FRAME_SIZE, MIN_FRAME_SIZE, SYNC_BYTE_VARIANTS } from "./constants";
import { CrossfireFrame } from "./frame";

export class CrossfireParser {
  private buffer: Uint8Array = new Uint8Array(0);
  private offset = 0;

  constructor(private onFrame: (frame: CrossfireFrame) => void) {}

  appendChunk(data: ArrayBuffer | ArrayBufferView) {
    // hard sanity guard
    if (this.offset > this.buffer.length) {
      // parser invariant broken → reset safely
      this.buffer = new Uint8Array(0);
      this.offset = 0;
    }

    const newBuffer =
      data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

    if (this.offset === this.buffer.length) {
      // previous buffer fully consumed → replace
      this.buffer = newBuffer;
    } else {
      // some leftover → merge
      const leftover = this.buffer.subarray(this.offset);
      const merged = new Uint8Array(leftover.length + newBuffer.length);
      merged.set(leftover, 0);
      merged.set(newBuffer, leftover.length);
      this.buffer = merged;
    }
    this.offset = 0;

    this.parseFrames();
  }

  private parseFrames() {
    while (this.offset < this.buffer.length) {
      const syncOffset = this.offset;
      const syncByte = this.buffer[this.offset]!;

      if (!SYNC_BYTE_VARIANTS.has(syncByte)) {
        this.offset++;
        continue;
      }

      const frameLengthOffset = syncOffset + 1;
      if (frameLengthOffset >= this.buffer.length) break; // not enough data to read length

      const frameLength = this.buffer[frameLengthOffset]!;
      if (frameLength < MIN_FRAME_SIZE || frameLength > MAX_FRAME_SIZE) {
        // invalid length
        this.offset++;
        continue;
      }

      const frameTypeOffset = frameLengthOffset + 1;
      const payloadStartOffset = frameTypeOffset + 1;
      const crcOffset = payloadStartOffset + (frameLength - 2);

      if (crcOffset >= this.buffer.length) break; // not enough data to read full frame

      const crc = this.buffer[crcOffset]!;
      const crcData = this.buffer.subarray(frameTypeOffset, crcOffset); // end exclusive
      const computedCrc = getCRC(crcData);

      if (crc !== computedCrc) {
        // invalid crc, skip this sync byte
        this.offset += 1;
        continue;
      }

      const payload = this.buffer.subarray(payloadStartOffset, crcOffset); // end exclusive
      const frameType = this.buffer[frameTypeOffset]!;

      this.onFrame(new CrossfireFrame(syncByte, frameType, payload));

      this.offset = crcOffset + 1;
    }
  }
}
