import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

/** Clamps a number to the 0-2047 (11-bit) range */
const clamp11 = (v: number) => Math.max(0, Math.min(0x7ff, v));

/** Packs 16 channels of 11 bits each into a 22-byte Uint8Array */
const pack11BitChannels = (channels: number[], out: Uint8Array) => {
  if (channels.length !== 16) throw new Error("channels array must have exactly 16 elements");

  let bitPos = 0;

  for (let ch = 0; ch < channels.length; ch++) {
    const value = clamp11(channels[ch]!);

    for (let i = 0; i < 11; i++) {
      if (value & (1 << i)) {
        const byteIndex = (bitPos + i) >> 3;
        const bitIndex = (bitPos + i) & 7;
        out[byteIndex]! |= 1 << bitIndex;
      }
    }

    bitPos += 11;
  }
};

/** Unpacks 16 channels of 11 bits each from a 22-byte Uint8Array */
const unpackChannels = (payload: Uint8Array): number[] => {
  const channels: number[] = new Array(16).fill(1024);
  let bitPos = 0;

  for (let ch = 0; ch < 16; ch++) {
    let value = 0;

    for (let i = 0; i < 11; i++) {
      const byteIndex = (bitPos + i) >> 3;
      const bitIndex = (bitPos + i) & 7;

      if (payload[byteIndex]! & (1 << bitIndex)) {
        value |= 1 << i;
      }
    }

    channels[ch] = clamp11(value);
    bitPos += 11;
  }

  return channels;
};

/** 16 channels packed into 22 bytes. Channels are ticks not microseconds */
@staticImplements<InternalCrossfireFrameVariant>()
export class RCChannelsPacked11Bits {
  constructor(
    public channel1Ticks: number = 1024,
    public channel2Ticks: number = 1024,
    public channel3Ticks: number = 1024,
    public channel4Ticks: number = 1024,
    public channel5Ticks: number = 1024,
    public channel6Ticks: number = 1024,
    public channel7Ticks: number = 1024,
    public channel8Ticks: number = 1024,
    public channel9Ticks: number = 1024,
    public channel10Ticks: number = 1024,
    public channel11Ticks: number = 1024,
    public channel12Ticks: number = 1024,
    public channel13Ticks: number = 1024,
    public channel14Ticks: number = 1024,
    public channel15Ticks: number = 1024,
    public channel16Ticks: number = 1024,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 22;
  }

  get frameType() {
    return FRAME_TYPE.RC_CHANNELS_PACKED_11_BITS;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(RCChannelsPacked11Bits.payloadSize);

    pack11BitChannels(
      [
        this.channel1Ticks,
        this.channel2Ticks,
        this.channel3Ticks,
        this.channel4Ticks,
        this.channel5Ticks,
        this.channel6Ticks,
        this.channel7Ticks,
        this.channel8Ticks,
        this.channel9Ticks,
        this.channel10Ticks,
        this.channel11Ticks,
        this.channel12Ticks,
        this.channel13Ticks,
        this.channel14Ticks,
        this.channel15Ticks,
        this.channel16Ticks,
      ],
      payload
    );

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): RCChannelsPacked11Bits | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.RC_CHANNELS_PACKED_11_BITS) {
      throw new Error(`Invalid frame type for RCChannelsPacked: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < RCChannelsPacked11Bits.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const channels = unpackChannels(frame.payload);
    return new RCChannelsPacked11Bits(...channels, frame.syncByte);
  }
}
