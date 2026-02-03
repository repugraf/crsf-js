import type { FRAME_TYPE } from "../constants";
import type { CrossfireFrame } from "./frame";

/** Workaround for static interface implementation */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

/** Used for variant definitions. Shouldn't be used directly by client (unless necessary) */
export interface InternalCrossfireFrameVariantInstance {
  get frameType(): (typeof FRAME_TYPE)[keyof typeof FRAME_TYPE];
  get crossfireFrame(): CrossfireFrame;
}

/** Used for variant definitions. Shouldn't be used directly by client (unless necessary) */
export interface InternalCrossfireFrameVariant {
  new (...args: any[]): InternalCrossfireFrameVariantInstance;
  get payloadSize(): number;
  fromFrame(frame: CrossfireFrame): InternalCrossfireFrameVariantInstance;
}

const UINT24_MAX = 0xffffff;

export const setUint24BE = (view: DataView, offset: number, value: number) => {
  const clampedValue = Math.max(0, Math.min(UINT24_MAX, Math.trunc(value)));
  view.setUint8(offset, (clampedValue >> 16) & 0xff);
  view.setUint8(offset + 1, (clampedValue >> 8) & 0xff);
  view.setUint8(offset + 2, clampedValue & 0xff);
};

export const getUint24BE = (view: DataView, offset: number): number =>
  (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);

const INT24_MIN = -0x800000;
const INT24_MAX = 0x7fffff;

export const setInt24BE = (view: DataView, offset: number, value: number) => {
  const clamped = Math.max(INT24_MIN, Math.min(INT24_MAX, Math.trunc(value)));

  // Convert to unsigned 24-bit representation
  const v = clamped < 0 ? clamped + 0x1000000 : clamped;

  view.setUint8(offset, (v >> 16) & 0xff);
  view.setUint8(offset + 1, (v >> 8) & 0xff);
  view.setUint8(offset + 2, v & 0xff);
};

export const getInt24BE = (view: DataView, offset: number): number => {
  const v =
    (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);

  // Sign bit check (bit 23)
  return v & 0x800000 ? v - 0x1000000 : v;
};

export const encodeCString = (str: string): Uint8Array => {
  const encoder = new TextEncoder(); // UTF-8 but ASCII-safe
  const bytes = encoder.encode(str);
  const out = new Uint8Array(bytes.length + 1);
  out.set(bytes, 0);
  out[bytes.length] = 0x00;
  return out;
};

export const decodeCString = (buffer: Uint8Array): string => {
  const end = buffer.indexOf(0x00);
  const slice = end === -1 ? buffer : buffer.subarray(0, end);
  return new TextDecoder().decode(slice);
};
