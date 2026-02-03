# CRSF JS

A lightweight, cross-environment TypeScript/JavaScript library for parsing and serializing [CRSF (Crossfire)](https://github.com/tbs-fpv/tbs-crsf-spec) protocol frames. Commonly used by TBS Crossfire, ExpressLRS, and other RC systems.

## Features

- **Cross-environment** - Works in any JavaScript runtime: Node.js, Bun, Deno, and browsers
- **Zero dependencies** - Pure TypeScript implementation with no external dependencies
- **Transport-agnostic** - Designed to work with any byte stream source (serial ports, WebSerial, Bluetooth, WebSocket, etc.)
- **Full protocol support** - Parses and serializes all standard CRSF frame types including:
  - RC Channels (packed 11-bit, subset)
  - Link Statistics (TX/RX)
  - GPS, GPS Time, GPS Extended
  - Attitude, Barometer, Variometer
  - Battery Sensor, Voltages
  - Magnetometer, Accelerometer/Gyro
  - Flight Mode, Heartbeat, VTX Telemetry
  - And more...
- **Type-safe** - Full TypeScript support with discriminated unions for frame variants

## Installation

```bash
# npm
npm install crsf

# yarn
yarn add crsf

# pnpm
pnpm add crsf

# bun
bun add crsf
```

## Usage

### Basic Parsing

The library expects a stream of bytes and handles frame detection, validation, and parsing internally. You are responsible for providing the transport layer (serial connection, WebSocket, etc.).

```typescript
import { CrossfireParser, getFrameVariant, FRAME_TYPE } from 'crsf';

const parser = new CrossfireParser((frame) => {
  const variant = getFrameVariant(frame);

  switch (variant.frameType) {
    case FRAME_TYPE.RC_CHANNELS_PACKED:
      console.log('RC Channels:', {
        ch1: variant.channel1,
        ch2: variant.channel2,
        ch3: variant.channel3,
        ch4: variant.channel4,
        // ... channels 1-16 available
      });
      break;

    case FRAME_TYPE.LINK_STATISTICS:
      console.log('Link Stats:', {
        rssi: variant.puRssiAnt1,
        linkQuality: variant.upLinkQuality,
        snr: variant.upSnr,
      });
      break;

    case FRAME_TYPE.GPS:
      console.log('GPS:', {
        lat: variant.latitude / 10_000_000,
        lon: variant.longitude / 10_000_000,
        altitude: variant.altitude,
        satellites: variant.satellites,
      });
      break;

    case FRAME_TYPE.BATTERY_SENSOR:
      console.log('Battery:', {
        voltage: variant.voltage / 10, // Volts
        current: variant.current / 10, // Amps
        remaining: variant.remaining,  // Percent
      });
      break;
  }
});

// Feed data chunks as they arrive from your transport layer
parser.appendChunk(data); // ArrayBuffer or ArrayBufferView
```

### Serializing Frames

```typescript
import { serialize, RCChannelsPacked, GPS, BatterySensor } from 'crsf';

// Create RC channels frame
const rcChannels = new RCChannelsPacked(
  1500, 1500, 1000, 1500, // channels 1-4
  1000, 1000, 1000, 1000, // channels 5-8
  1000, 1000, 1000, 1000, // channels 9-12
  1000, 1000, 1000, 1000  // channels 13-16
);

// Serialize to bytes
const bytes = serialize(rcChannels.crossfireFrame);

// Send bytes over your transport layer
serialPort.write(bytes);
```

## Integration Examples

### Node.js with SerialPort

```typescript
import { SerialPort } from 'serialport';
import { CrossfireParser, getFrameVariant, FRAME_TYPE, serialize, RCChannelsPacked } from 'crsf';

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 420000, // CRSF standard baud rate
});

const parser = new CrossfireParser((frame) => {
  const variant = getFrameVariant(frame);
  
  if (variant.frameType === FRAME_TYPE.LINK_STATISTICS) {
    console.log(`RSSI: ${variant.puRssiAnt1} dBm, LQ: ${variant.upLinkQuality}%`);
  }
});

// Receive data
port.on('data', (chunk) => {
  parser.appendChunk(chunk);
});

// Send RC channels
const rcFrame = new RCChannelsPacked(1500, 1500, 1000, 1500);
port.write(serialize(rcFrame.crossfireFrame));
```

### Browser with Web Serial API

```typescript
import { CrossfireParser, getFrameVariant, FRAME_TYPE } from 'crsf';

async function connectSerial() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 420000 });

  const parser = new CrossfireParser((frame) => {
    const variant = getFrameVariant(frame);
    console.log('Frame received:', variant.frameType);
  });

  const reader = port.readable.getReader();
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.appendChunk(value);
  }
}
```

### Deno with Web Serial

```typescript
import { CrossfireParser, getFrameVariant } from 'npm:crsf';

const port = await navigator.serial.requestPort();
await port.open({ baudRate: 420000 });

const parser = new CrossfireParser((frame) => {
  const variant = getFrameVariant(frame);
  console.log('Received:', variant.constructor.name);
});

for await (const chunk of port.readable) {
  parser.appendChunk(chunk);
}
```

## Supported Frame Types

| Frame Type | Class | Description |
| ---------- | ----- | ----------- |
| `RC_CHANNELS_PACKED` | `RCChannelsPacked` | 16 RC channels (11-bit packed) |
| `RC_CHANNELS_PACKED_11_BITS` | `RCChannelsPacked11Bits` | Alternative 11-bit packing |
| `SUBSET_RC_CHANNELS_PACKED` | `SubsetRCChannelsPacked` | Subset of RC channels |
| `LINK_STATISTICS` | `LinkStatistics` | Link quality metrics |
| `LINK_STATISTICS_TX` | `LinkStatisticsTx` | TX-specific link stats |
| `LINK_STATISTICS_RX` | `LinkStatisticsRx` | RX-specific link stats |
| `GPS` | `GPS` | Position, speed, heading |
| `GPS_TIME` | `GPSTime` | GPS timestamp |
| `GPS_EXTENDED` | `GPSExtended` | Extended GPS data |
| `ATTITUDE` | `Attitude` | Pitch, roll, yaw |
| `BATTERY_SENSOR` | `BatterySensor` | Voltage, current, capacity |
| `BAROMETER` | `Barometer` | Pressure, temperature |
| `BAROMETRIC_ALTITUDE_VERTICAL_SPEED` | `BarometricAltitudeVerticalSpeed` | Altitude & vario |
| `VARIOMETER_SENSOR` | `VariometerSensor` | Vertical speed |
| `MAGNETOMETER` | `Magnetometer` | Magnetic field XYZ |
| `ACCEL_GYRO` | `AccelGyro` | IMU data |
| `AIRSPEED` | `Airspeed` | Airspeed sensor |
| `FLIGHT_MODE` | `FlightMode` | Current flight mode |
| `HEARTBEAT` | `Heartbeat` | Device heartbeat |
| `VTX_TELEMETRY` | `VTXTelemetry` | VTX settings |

## API Reference

### `CrossfireParser`

Main parser class that processes incoming byte streams.

```typescript
const parser = new CrossfireParser(onFrame: (frame: CrossfireFrame) => void);
parser.appendChunk(data: ArrayBuffer | ArrayBufferView): void;
```

### `getFrameVariant(frame: CrossfireFrame)`

Converts a raw frame to a typed variant class with parsed fields.

### `serialize(frame: CrossfireFrame)`

Serializes a frame to a `Uint8Array` ready for transmission.

### Frame Variant Classes

Each frame type has a corresponding class (e.g., `GPS`, `RCChannelsPacked`, `LinkStatistics`) that:

- Can be instantiated with field values for serialization
- Provides a `crossfireFrame` getter for conversion to `CrossfireFrame`
- Has a static `fromFrame()` method for parsing
- Has a `frameType` property matching `FRAME_TYPE` constants

## Protocol Notes

- Standard CRSF baud rate: **420000**
- Frame structure: `[SYNC] [LENGTH] [TYPE] [PAYLOAD...] [CRC]`
- Maximum payload size: 60 bytes
- CRC: CRC8 DVB-S2

## License

ISC

## References

- [TBS CRSF Specification](https://github.com/tbs-fpv/tbs-crsf-spec)
- [ExpressLRS](https://www.expresslrs.org/)
- [ArduPilot CRSF Implementation](https://github.com/ArduPilot/ardupilot/blob/master/libraries/AP_RCProtocol/AP_RCProtocol_CRSF.h)
