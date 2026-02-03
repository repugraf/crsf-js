import { describe, it, expect } from "vitest";
import {
  CrossfireParser,
  FRAME_TYPE,
  getFrameVariant,
  RCChannelsPacked,
  LinkStatistics,
  GPS,
  Attitude,
  BatterySensor,
  Barometer,
  VariometerSensor,
  Magnetometer,
  Airspeed,
  AccelGyro,
  BarometricAltitudeVerticalSpeed,
  serialize,
} from "../src";

describe("serialization and parsing", () => {
  it("should serialize and parse RCChannelsPacked frame correctly", () => {
    const originalRcChannelsPacked = new RCChannelsPacked(
      1500,
      1600,
      1000,
      1800,
      1900,
      2000,
      1561,
      1999
    );

    let parsedVariant: RCChannelsPacked | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);

      switch (variant.frameType) {
        case FRAME_TYPE.RC_CHANNELS_PACKED:
          parsedVariant = variant;
          break;
      }
    });

    parser.appendChunk(serialize(originalRcChannelsPacked.crossfireFrame));

    const parsedRcChannelsPacked = parsedVariant as RCChannelsPacked | null;

    if (!parsedRcChannelsPacked)
      throw new Error("Parsed variant is null or not of type RCChannelsPacked");

    const originalFrame = originalRcChannelsPacked.crossfireFrame;
    const parsedFrame = parsedRcChannelsPacked.crossfireFrame;

    expect(originalFrame.type).toBe(parsedFrame.type);
    expect(originalFrame.syncByte).toBe(parsedFrame.syncByte);
    expect(originalFrame.payload.length).toBe(parsedFrame.payload.length);
    expect(originalFrame.payload.buffer).toEqual(parsedFrame.payload.buffer);

    expect(originalRcChannelsPacked.channel1).toBe(parsedRcChannelsPacked.channel1);
    expect(originalRcChannelsPacked.channel2).toBe(parsedRcChannelsPacked.channel2);
    expect(originalRcChannelsPacked.channel3).toBe(parsedRcChannelsPacked.channel3);
    expect(originalRcChannelsPacked.channel4).toBe(parsedRcChannelsPacked.channel4);
    expect(originalRcChannelsPacked.channel5).toBe(parsedRcChannelsPacked.channel5);
    expect(originalRcChannelsPacked.channel6).toBe(parsedRcChannelsPacked.channel6);
    expect(originalRcChannelsPacked.channel7).toBe(parsedRcChannelsPacked.channel7);
    expect(originalRcChannelsPacked.channel8).toBe(parsedRcChannelsPacked.channel8);
  });

  it("should serialize and parse LinkStatistics frame correctly", () => {
    const originalLinkStatistics = new LinkStatistics(
      200,
      24,
      22,
      -32,
      155,
      56,
      144,
      141,
      250,
      -117
    );

    let parsedVariant: LinkStatistics | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);

      switch (variant.frameType) {
        case FRAME_TYPE.LINK_STATISTICS:
          parsedVariant = variant;
          break;
      }
    });

    parser.appendChunk(serialize(originalLinkStatistics.crossfireFrame));

    const parsedLinkStatistics = parsedVariant as LinkStatistics | null;

    if (!parsedLinkStatistics)
      throw new Error("Parsed variant is null or not of type LinkStatistics");

    const originalFrame = originalLinkStatistics.crossfireFrame;
    const parsedFrame = parsedLinkStatistics.crossfireFrame;

    expect(originalFrame.type).toBe(parsedFrame.type);
    expect(originalFrame.syncByte).toBe(parsedFrame.syncByte);
    expect(originalFrame.payload.length).toBe(parsedFrame.payload.length);
    expect(originalFrame.payload.buffer).toEqual(parsedFrame.payload.buffer);

    expect(originalLinkStatistics.puRssiAnt1).toBe(parsedLinkStatistics.puRssiAnt1);
    expect(originalLinkStatistics.puRssiAnt2).toBe(parsedLinkStatistics.puRssiAnt2); // why 12???
    expect(originalLinkStatistics.upLinkQuality).toBe(parsedLinkStatistics.upLinkQuality);
    expect(originalLinkStatistics.upSnr).toBe(parsedLinkStatistics.upSnr);
    expect(originalLinkStatistics.activeAntenna).toBe(parsedLinkStatistics.activeAntenna);
    expect(originalLinkStatistics.rfProfile).toBe(parsedLinkStatistics.rfProfile);
    expect(originalLinkStatistics.upRfPower).toBe(parsedLinkStatistics.upRfPower);
    expect(originalLinkStatistics.downRssi).toBe(parsedLinkStatistics.downRssi);
    expect(originalLinkStatistics.downLinkQuality).toBe(parsedLinkStatistics.downLinkQuality);
    expect(originalLinkStatistics.downSnr).toBe(parsedLinkStatistics.downSnr);
  });

  it("should serialize and parse GPS frame correctly", () => {
    const original = new GPS(
      505000000, // latitude
      304500000, // longitude
      12050, // groundSpeed
      18000, // heading
      1500, // altitude
      12 // satellites
    );

    let parsedVariant: GPS | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.GPS) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    const parsed = parsedVariant as GPS | null;
    if (!parsed) throw new Error("Parsed variant is null");

    expect(original.latitude).toBe(parsed.latitude);
    expect(original.longitude).toBe(parsed.longitude);
    expect(original.groundSpeed).toBe(parsed.groundSpeed);
    expect(original.heading).toBe(parsed.heading);
    expect(original.altitude).toBe(parsed.altitude);
    expect(original.satellites).toBe(parsed.satellites);
  });

  it("should serialize and parse Attitude frame correctly", () => {
    const original = new Attitude(
      1234, // pitch
      -5678, // roll
      9012 // yaw
    );

    let parsedVariant: Attitude | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.ATTITUDE) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    const parsed = parsedVariant as Attitude | null;
    if (!parsed) throw new Error("Parsed variant is null");

    expect(original.pitch).toBe(parsed.pitch);
    expect(original.roll).toBe(parsed.roll);
    expect(original.yaw).toBe(parsed.yaw);
  });

  it("should serialize and parse BatterySensor frame correctly", () => {
    const original = new BatterySensor(
      11800, // voltage (11.8V in 10µV units)
      2500, // current (25A in 10µA units)
      1500, // capacityUsed (mAh)
      75 // remaining (%)
    );

    let parsedVariant: BatterySensor | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.BATTERY_SENSOR) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    const parsed = parsedVariant as BatterySensor | null;
    if (!parsed) throw new Error("Parsed variant is null");

    expect(original.voltage).toBe(parsed.voltage);
    expect(original.current).toBe(parsed.current);
    expect(original.capacityUsed).toBe(parsed.capacityUsed);
    expect(original.remaining).toBe(parsed.remaining);
  });

  it("should serialize and parse Barometer frame correctly", () => {
    const original = new Barometer(
      101325, // pressurePa (1013.25 hPa)
      2500 // baroTemp (25°C in centidegrees)
    );

    let parsedVariant: Barometer | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.BAROMETER) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as Barometer;

    expect(original.pressurePa).toBe(parsed.pressurePa);
    expect(original.baroTemp).toBe(parsed.baroTemp);
  });

  it("should serialize and parse VariometerSensor frame correctly", () => {
    const original = new VariometerSensor(-250); // -2.5 m/s

    let parsedVariant: VariometerSensor | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.VARIOMETER_SENSOR) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as VariometerSensor;

    expect(original.vSpeed).toBe(parsed.vSpeed);
  });

  it("should serialize and parse Magnetometer frame correctly", () => {
    const original = new Magnetometer(
      1500, // fieldX
      -2000, // fieldY
      3500 // fieldZ
    );

    let parsedVariant: Magnetometer | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.MAGNETOMETER) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as Magnetometer;

    expect(original.fieldX).toBe(parsed.fieldX);
    expect(original.fieldY).toBe(parsed.fieldY);
    expect(original.fieldZ).toBe(parsed.fieldZ);
  });

  it("should serialize and parse Airspeed frame correctly", () => {
    const original = new Airspeed(1200); // 120 km/h

    let parsedVariant: Airspeed | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.AIRSPEED) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as Airspeed;

    expect(original.speed).toBe(parsed.speed);
  });

  it("should serialize and parse AccelGyro frame correctly", () => {
    const original = new AccelGyro(
      123456789, // sampleTime
      100, // gyroX
      -200, // gyroY
      300, // gyroZ
      500, // accX
      -600, // accY
      700, // accZ
      2500 // gyroTemp
    );

    let parsedVariant: AccelGyro | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.ACCEL_GYRO) parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as AccelGyro;

    expect(original.sampleTime).toBe(parsed.sampleTime);
    expect(original.gyroX).toBe(parsed.gyroX);
    expect(original.gyroY).toBe(parsed.gyroY);
    expect(original.gyroZ).toBe(parsed.gyroZ);
    expect(original.accX).toBe(parsed.accX);
    expect(original.accY).toBe(parsed.accY);
    expect(original.accZ).toBe(parsed.accZ);
    expect(original.gyroTemp).toBe(parsed.gyroTemp);
  });

  it("should serialize and parse BarometricAltitudeVerticalSpeed frame correctly", () => {
    const original = new BarometricAltitudeVerticalSpeed(
      5000, // altitudePacked
      -50 // verticalSpeedPacked
    );

    let parsedVariant: BarometricAltitudeVerticalSpeed | null = null;
    const parser = new CrossfireParser(frame => {
      const variant = getFrameVariant(frame);
      if (variant.frameType === FRAME_TYPE.BAROMETRIC_ALTITUDE_VERTICAL_SPEED)
        parsedVariant = variant;
    });

    parser.appendChunk(serialize(original.crossfireFrame));

    if (!parsedVariant) throw new Error("Parsed variant is null");
    const parsed = parsedVariant as BarometricAltitudeVerticalSpeed;

    expect(original.altitudePacked).toBe(parsed.altitudePacked);
    expect(original.verticalSpeedPacked).toBe(parsed.verticalSpeedPacked);
  });
});
