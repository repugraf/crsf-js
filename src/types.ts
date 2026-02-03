export type BuildRange<
  Start extends number,
  End extends number,
  Acc extends number[] = [],
> = Acc["length"] extends End ? Acc[number] : BuildRange<Start, End, [...Acc, Acc["length"]]>;

export type Range<Start extends number, End extends number> = Exclude<
  BuildRange<0, End>,
  BuildRange<0, Start>
>;

export type BuildTuple<N extends number, R extends unknown[] = []> = R["length"] extends N
  ? R
  : BuildTuple<N, [...R, unknown]>;

export type Add<A extends number, B extends number> = [
  ...BuildTuple<A>,
  ...BuildTuple<B>,
]["length"];

export type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer R] ? R["length"] : never;

export type AnyNumber = number & {};
