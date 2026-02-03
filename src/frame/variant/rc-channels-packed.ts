import { FRAME_TYPE, SERIAL_SYNC_BYTE } from "../../constants";
import { CrossfireFrame } from "../frame";
import { staticImplements, type InternalCrossfireFrameVariant } from "../util";
import { UnsupportedOrInvalid } from "./unsupported-or-invalid";

/** Converts microseconds to 11-bit ticks used in RC channels */
const usToTicks = (us: number): number => Math.round(((us - 1500) * 8) / 5 + 992);

/** Converts 11-bit ticks used in RC channels to microseconds */
const ticksToUs = (ticks: number): number => Math.round(((ticks - 992) * 5) / 8 + 1500);

/** Clamps a number to the 0-2047 (11-bit) range */
const clamp11 = (v: number) => Math.max(0, Math.min(0x7ff, v));

/** Packs 16 channels of 11 bits each into a 22-byte Uint8Array */
const packChannels = (channels: number[], out: Uint8Array) => {
  if (channels.length !== 16) throw new Error("channels array must have exactly 16 elements");

  let bitPos = 0;

  for (let ch = 0; ch < channels.length; ch++) {
    const value = clamp11(usToTicks(channels[ch]!));

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
  const channels: number[] = new Array(16).fill(1000);
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

    channels[ch] = ticksToUs(value);
    bitPos += 11;
  }

  return channels;
};

/** 16 channels packed into 22 bytes */
@staticImplements<InternalCrossfireFrameVariant>()
export class RCChannelsPacked {
  constructor(
    public channel1: number = 1000,
    public channel2: number = 1000,
    public channel3: number = 1000,
    public channel4: number = 1000,
    public channel5: number = 1000,
    public channel6: number = 1000,
    public channel7: number = 1000,
    public channel8: number = 1000,
    public channel9: number = 1000,
    public channel10: number = 1000,
    public channel11: number = 1000,
    public channel12: number = 1000,
    public channel13: number = 1000,
    public channel14: number = 1000,
    public channel15: number = 1000,
    public channel16: number = 1000,
    public syncByte: number = SERIAL_SYNC_BYTE
  ) {}

  static get payloadSize() {
    return 22;
  }

  get frameType() {
    return FRAME_TYPE.RC_CHANNELS_PACKED;
  }

  get crossfireFrame(): CrossfireFrame {
    const payload = new Uint8Array(RCChannelsPacked.payloadSize);

    packChannels(
      [
        this.channel1,
        this.channel2,
        this.channel3,
        this.channel4,
        this.channel5,
        this.channel6,
        this.channel7,
        this.channel8,
        this.channel9,
        this.channel10,
        this.channel11,
        this.channel12,
        this.channel13,
        this.channel14,
        this.channel15,
        this.channel16,
      ],
      payload
    );

    return new CrossfireFrame(this.syncByte, this.frameType, payload);
  }

  static fromFrame(frame: CrossfireFrame): RCChannelsPacked | UnsupportedOrInvalid {
    if (frame.type !== FRAME_TYPE.RC_CHANNELS_PACKED) {
      throw new Error(`Invalid frame type for RCChannelsPacked: ${frame.type.toString(16)}`);
    }

    if (frame.payload.length < RCChannelsPacked.payloadSize) {
      return new UnsupportedOrInvalid(frame.type, frame.payload, frame.syncByte);
    }

    const channels = unpackChannels(frame.payload);
    return new RCChannelsPacked(...channels, frame.syncByte);
  }
}
