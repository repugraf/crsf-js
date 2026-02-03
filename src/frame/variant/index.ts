import { FRAME_TYPE } from "../../constants";
import type { CrossfireFrame } from "../frame";

import { UnsupportedOrInvalid } from "./unsupported-or-invalid";
import { GPS } from "./gps";
import { GPSTime } from "./gps-time";
import { GPSExtended } from "./gps-extended";
import { VariometerSensor } from "./variometer-sensor";
import { BatterySensor } from "./battery-sensor";
import { BarometricAltitudeVerticalSpeed } from "./barometric-altitude-vertical-speed";
import { Airspeed } from "./airspeed";
import { Heartbeat } from "./heartbeat";
import { RMP } from "./rpm";
import { Temp } from "./temp";
import { Voltages } from "./voltages";
import { Discontinued } from "./discontinued";
import { VTXTelemetry } from "./vtx-telemetry";
import { Barometer } from "./barometer";
import { Magnetometer } from "./magnetometer";
import { AccelGyro } from "./accel-gyro";
import { LinkStatistics } from "./link-statistics";
import { RCChannelsPacked } from "./rc-channels-packed";
import { SubsetRCChannelsPacked } from "./subset-rc-channels-packed";
import { RCChannelsPacked11Bits } from "./rc-channels-packed-11-bits";
import { ReservedCrossfire0 } from "./reserved-crossfire-0";
import { ReservedCrossfire1 } from "./reserved-crossfire-1";
import { ReservedCrossfire2 } from "./reserved-crossfire-2";
import { LinkStatisticsRx } from "./link-statistics-rx";
import { LinkStatisticsTx } from "./link-statistics-tx";
import { Attitude } from "./attitude";
import { MavLinkFC } from "./mav-link-fc";
import { FlightMode } from "./flight-mode";
import { EspNowMessage } from "./esp-now-message";
import { Reserved } from "./reserved";

/** All possible Crossfire frame variants */
export type CrossfireFrameVariant =
  | UnsupportedOrInvalid
  | GPS
  | GPSTime
  | GPSExtended
  | VariometerSensor
  | BatterySensor
  | BarometricAltitudeVerticalSpeed
  | Airspeed
  | Heartbeat
  | RMP
  | Temp
  | Voltages
  | Discontinued
  | VTXTelemetry
  | Barometer
  | Magnetometer
  | AccelGyro
  | LinkStatistics
  | RCChannelsPacked
  | SubsetRCChannelsPacked
  | RCChannelsPacked11Bits
  | ReservedCrossfire0
  | ReservedCrossfire1
  | ReservedCrossfire2
  | LinkStatisticsRx
  | LinkStatisticsTx
  | Attitude
  | MavLinkFC
  | FlightMode
  | EspNowMessage
  | Reserved;

/**
 * Get the appropriate frame variant based on the frame type.
 * The returned type can be used within switch statement to narrow down the type.
 *
 * @example
 * ```ts
 * const variant = getFrameVariant(frame);
 * switch (variant.frameType) {
 *   case FRAME_TYPE.GPS:
 *     // variant is of type GPS here
 *     break;
 * */
export const getFrameVariant = (frame: CrossfireFrame): CrossfireFrameVariant => {
  switch (frame.type) {
    case FRAME_TYPE.GPS:
      return GPS.fromFrame(frame);
    case FRAME_TYPE.GPS_TIME:
      return GPSTime.fromFrame(frame);
    case FRAME_TYPE.GPS_EXTENDED:
      return GPSExtended.fromFrame(frame);
    case FRAME_TYPE.VARIOMETER_SENSOR:
      return VariometerSensor.fromFrame(frame);
    case FRAME_TYPE.BATTERY_SENSOR:
      return BatterySensor.fromFrame(frame);
    case FRAME_TYPE.BAROMETRIC_ALTITUDE_VERTICAL_SPEED:
      return BarometricAltitudeVerticalSpeed.fromFrame(frame);
    case FRAME_TYPE.AIRSPEED:
      return Airspeed.fromFrame(frame);
    case FRAME_TYPE.HEARTBEAT:
      return Heartbeat.fromFrame(frame);
    case FRAME_TYPE.RPM:
      return RMP.fromFrame(frame);
    case FRAME_TYPE.TEMP:
      return Temp.fromFrame(frame);
    case FRAME_TYPE.VOLTAGES:
      return Voltages.fromFrame(frame);
    case FRAME_TYPE.DISCONTINUED:
      return Discontinued.fromFrame(frame);
    case FRAME_TYPE.VTX_TELEMETRY:
      return VTXTelemetry.fromFrame(frame);
    case FRAME_TYPE.BAROMETER:
      return Barometer.fromFrame(frame);
    case FRAME_TYPE.MAGNETOMETER:
      return Magnetometer.fromFrame(frame);
    case FRAME_TYPE.ACCEL_GYRO:
      return AccelGyro.fromFrame(frame);
    case FRAME_TYPE.LINK_STATISTICS:
      return LinkStatistics.fromFrame(frame);
    case FRAME_TYPE.RC_CHANNELS_PACKED:
      return RCChannelsPacked.fromFrame(frame);
    case FRAME_TYPE.SUBSET_RC_CHANNELS_PACKED:
      return SubsetRCChannelsPacked.fromFrame(frame);
    case FRAME_TYPE.RC_CHANNELS_PACKED_11_BITS:
      return RCChannelsPacked11Bits.fromFrame(frame);
    case FRAME_TYPE.RESERVED_CROSSFIRE_0:
      return ReservedCrossfire0.fromFrame(frame);
    case FRAME_TYPE.RESERVED_CROSSFIRE_1:
      return ReservedCrossfire1.fromFrame(frame);
    case FRAME_TYPE.RESERVED_CROSSFIRE_2:
      return ReservedCrossfire2.fromFrame(frame);
    case FRAME_TYPE.LINK_STATISTICS_RX:
      return LinkStatisticsRx.fromFrame(frame);
    case FRAME_TYPE.LINK_STATISTICS_TX:
      return LinkStatisticsTx.fromFrame(frame);
    case FRAME_TYPE.ATTITUDE:
      return Attitude.fromFrame(frame);
    case FRAME_TYPE.MAV_LINK_FC:
      return MavLinkFC.fromFrame(frame);
    case FRAME_TYPE.FLIGHT_MODE:
      return FlightMode.fromFrame(frame);
    case FRAME_TYPE.ESP_NOW_MESSAGE:
      return EspNowMessage.fromFrame(frame);
    case FRAME_TYPE.RESERVED:
      return Reserved.fromFrame(frame);
    default:
      return UnsupportedOrInvalid.fromFrame(frame);
  }
};

export {
  UnsupportedOrInvalid,
  GPS,
  GPSTime,
  GPSExtended,
  VariometerSensor,
  BatterySensor,
  BarometricAltitudeVerticalSpeed,
  Airspeed,
  Heartbeat,
  RMP,
  Temp,
  Voltages,
  Discontinued,
  VTXTelemetry,
  Barometer,
  Magnetometer,
  AccelGyro,
  LinkStatistics,
  RCChannelsPacked,
  SubsetRCChannelsPacked,
  RCChannelsPacked11Bits,
  ReservedCrossfire0,
  ReservedCrossfire1,
  ReservedCrossfire2,
  LinkStatisticsRx,
  LinkStatisticsTx,
  Attitude,
  MavLinkFC,
  FlightMode,
  EspNowMessage,
  Reserved,
};

/**
 * Internal types and utilities for Crossfire frame variants
 * Should only be used when creating new frame variants or using `getFrameVariantExtended`
 * */
export {
  type InternalCrossfireFrameVariant,
  type InternalCrossfireFrameVariantInstance,
  staticImplements,
} from "../util";
