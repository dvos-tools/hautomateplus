# Quick Examples

This document provides quick examples of how to use the Home Assistant Local Control library.

## Basic Connection

```typescript
import { HomeAssistantClient } from './src/index';

const client = new HomeAssistantClient('http://your-ha-instance:8123', 'your-access-token');
await client.connect();
```

## System Control

```typescript
import { SystemControlService } from './src/index';

// Control volume
await SystemControlService.setVolume(50);
await SystemControlService.volumeUp();
await SystemControlService.volumeDown();
await SystemControlService.mute();
await SystemControlService.unmute();

// Control brightness
await SystemControlService.setBrightness(75);

// Send notifications
await SystemControlService.sendNotification('Hello from Home Assistant!');

// Run shortcuts
await SystemControlService.runShortcut('MyShortcut');
```

## Custom Entities with DeviceEntityService

The app supports custom entities that are configured via a `config.yaml` file. These entities run macOS shortcuts and sync their output to Home Assistant using the same device naming and update logic as other device entities.

### 1. Create the Configuration File

Create a `config.yaml` file in your project root:

```yaml
# Home Assistant Local Control Configuration
systemControl:
  volume: true
  brightness: true
  notifications: true
  shortcuts: true
  locks: true
  customEntities: true

# Custom Entities Configuration
customEntities:
  enabled: true
  entities:
    - name: "MySensor"
      shortcutName: "MyShortcut"
      filePath: "~/hautomateplus/my_shortcut_output.txt"
      entityType: "sensor"
      unitOfMeasurement: "units"
      deviceClass: "generic"
    
    - name: "Temperature"
      shortcutName: "GetTemperature"
      filePath: "~/hautomateplus/temperature_output.txt"
      entityType: "sensor"
      unitOfMeasurement: "°C"
      deviceClass: "temperature"
    
    - name: "BatteryStatus"
      shortcutName: "CheckBattery"
      filePath: "~/hautomateplus/battery_output.txt"
      entityType: "sensor"
      unitOfMeasurement: "%"
      deviceClass: "battery"
```

### 2. Create macOS Shortcuts

For each custom entity, create a corresponding shortcut in the macOS Shortcuts app:

**MyShortcut** (for MySensor):
- Add a "Get Text" action with your desired value
- Add a "Save File" action to write to `~/hautomateplus/my_shortcut_output.txt`

**GetTemperature** (for Temperature):
- Add actions to get temperature data
- Save the result to `~/hautomateplus/temperature_output.txt`

**CheckBattery** (for BatteryStatus):
- Add actions to check battery status
- Save the result to `~/hautomateplus/battery_output.txt`

### 3. Use DeviceEntityService

The `DeviceEntityService` handles both device status entities and custom entities:

```typescript
import { DeviceEntityService } from './src/index';

// Create device entity service
const deviceEntityService = new DeviceEntityService();

// Initialize with custom entity configuration
const customEntityConfig = {
  enabled: true,
  entities: [
    {
      name: 'MySensor',
      shortcutName: 'MyShortcut',
      filePath: '~/hautomateplus/my_shortcut_output.txt',
      entityType: 'sensor',
      unitOfMeasurement: 'units',
      deviceClass: 'generic'
    }
  ]
};

await deviceEntityService.initialize(customEntityConfig);

// Start periodic updates (includes custom entities)
deviceEntityService.startPeriodicUpdates();
```

### 4. Entity Structure

All entities (device status and custom) are created under the same device in Home Assistant:

**Device Status Entities:**
- `binary_sensor.hautomateplus_connection` - Connection status
- `sensor.hautomateplus_device_name` - Device name

**Custom Entities:**
- `sensor.hautomateplus_mysensor` - MySensor value
- `sensor.hautomateplus_temperature` - Temperature value
- `sensor.hautomateplus_batterystatus` - Battery status value

All entities share the same device ID (`hautomateplus_device`) and are grouped together in Home Assistant.

## Volume Control

```typescript
import { VolumeService } from './src/index';

const volumeService = new VolumeService();

// Get current volume
const currentVolume = await volumeService.getVolume();
console.log(`Current volume: ${currentVolume}%`);

// Set volume
await volumeService.setVolume(75);

// Adjust volume
await volumeService.volumeUp();
await volumeService.volumeDown();

// Mute/Unmute
await volumeService.mute();
await volumeService.unmute();
```

## Shortcut Control

```typescript
import { ShortcutService } from './src/index';

// Run a shortcut
await ShortcutService.triggerShortcut('MyShortcut');

// Check if shortcut exists
const exists = await ShortcutService.isAvailable();
console.log(`Shortcut service available: ${exists}`);
```

## Device Information

```typescript
import { DeviceInfoService } from './src/index';

// Get device information
const deviceInfo = await DeviceInfoService.getDeviceInfo();
console.log('Device:', deviceInfo.deviceName);
console.log('Battery:', deviceInfo.batteryLevel + '%');

// Check battery status
const hasBattery = await DeviceInfoService.hasBattery();
if (hasBattery) {
  console.log('Battery charging:', deviceInfo.isCharging);
}
```

## Full Application Example

See `src/examples/05-full-app.ts` for a complete example that:
- Connects to Home Assistant
- Sets up device entities (including custom entities)
- Enables local control events
- Configures custom entities from YAML
- Handles reconnection and health monitoring
- Provides graceful shutdown

## Configuration

The app reads configuration from:
1. Environment variables (`.env` file)
2. `config.yaml` file (for custom entities)
3. Default values

### Environment Variables

```bash
HA_URL=http://your-ha-instance:8123
HA_ACCESS_TOKEN=your-access-token
HA_DEVICE_NAME=hautomateplus
LOG_LEVEL=info
MAX_RECONNECT_ATTEMPTS=10
```

### YAML Configuration

The `config.yaml` file supports:
- System control endpoints (volume, brightness, etc.)
- Custom entities configuration
- Device settings
- Connection settings

## Testing

Run the test examples to verify functionality:

```bash
# Test basic connection
npm run test:connection

# Test device info
npm run test:device-info

# Test shortcuts
npm run test:shortcut

# Test PM2 monitoring
npm run test:pm2-monitor
``` 