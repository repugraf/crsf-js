import type { CrossfireFrame } from "./frame";

export const serialize = (frame: CrossfireFrame): Uint8Array => {
  const buffer = new Uint8Array(2 + frame.length); // sync + length + type+payload+crc
  let offset = 0;

  buffer[offset++] = frame.syncByte;
  buffer[offset++] = frame.length;
  buffer[offset++] = frame.type;
  buffer.set(frame.payload, offset);
  offset += frame.payload.length;
  buffer[offset++] = frame.crc;

  return buffer;
};
