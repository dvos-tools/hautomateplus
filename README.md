# Home Assistant Local Control

A Node.js library for controlling macOS from Home Assistant via local-control events. This library provides system control capabilities (volume, brightness, notifications, shortcuts, locks) and can create custom entities that sync data from macOS shortcuts to Home Assistant.

## Features

- **System Control**: Volume, brightness, notifications, shortcuts, locks
- **Device Entities**: Expose device status (battery, connection) to Home Assistant
- **Custom Entities**: Create sensors from macOS shortcuts
- **WebSocket Connection**: Real-time communication with Home Assistant
- **Native Integration**: Uses Swift binaries for reliable system control
- **PM2 Support**: Production-ready with PM2 process management

## Quick Start

### 1. Installation

```bash
npm install hautomateplus
```

### 2. Environment Setup

Create a `.env` file:

```bash
HA_URL=http://your-ha-instance:8123
HA_ACCESS_TOKEN=your-access-token
HA_DEVICE_NAME=hautomateplus
LOG_LEVEL=info
```

### 3. Basic Usage

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

// Connect to Home Assistant
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for local-control events
client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});

// Keep the process running
process.on('SIGINT', () => {
  client.close();
  process.exit(0);
});
```

### 4. Custom Entities

Create custom entities that run macOS shortcuts and sync their output to Home Assistant:

```typescript
import { DeviceEntityService } from 'hautomateplus';

// Configure custom entities
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

// Initialize device entity service with custom entities
const deviceEntityService = new DeviceEntityService();
await deviceEntityService.initialize(customEntityConfig);

// Start periodic updates
deviceEntityService.startPeriodicUpdates();
```

## Configuration

### YAML Configuration

Create a `config.yaml` file for custom entities:

```yaml
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
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HA_URL` | Home Assistant URL | Required |
| `HA_ACCESS_TOKEN` | Home Assistant access token | Required |
| `HA_DEVICE_NAME` | Device name for entities | `hautomateplus` |
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_RECONNECT_ATTEMPTS` | Max reconnection attempts | `10` |

## Supported Commands

When Home Assistant sends a `local-control` event, you can execute these actions:

- `lock` - Lock your computer
- `volumeup` - Increase volume
- `volumedown` - Decrease volume  
- `mute` - Mute audio
- `unmute` - Unmute audio
- `notification` - Show notification

## Entity Structure

All entities are created under the same device in Home Assistant:

**Device Status Entities:**
- `binary_sensor.hautomateplus_connection` - Connection status
- `sensor.hautomateplus_device_name` - Device name

**Custom Entities:**
- `sensor.hautomateplus_mysensor` - Custom sensor value
- `sensor.hautomateplus_temperature` - Temperature value

All entities share the same device ID (`hautomateplus_device`) and are grouped together.

## Development

### Building Native Binaries

```bash
npm run build:native
```

### Building TypeScript

```bash
npm run build
```

### Running Examples

See [src/examples/README.md](src/examples/README.md) for detailed documentation of all examples.

```bash
# Basic connection
npm run build && node dist/examples/01-basic-connection.js

# System control
npm run build && node dist/examples/02-system-control.js

# Custom entities
npm run example:custom-entities

# Full application
npm run build && node dist/examples/05-full-app.js
```

### Testing

```bash
# Test connection
npm run test:connection

# Test device info
npm run test:device-info

# Test shortcuts
npm run test:shortcut
```

## PM2 Setup

For production deployment with PM2:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs hautomateplus
```

## Documentation

- [Home Assistant Setup](docs/1-home-assistant-setup.md)
- [Configuration](docs/2-configuration.md)
- [Quick Examples](docs/3-quick-examples.md)
- [PM2 Setup](docs/4-pm2-setup.md)
- [Device Entities](docs/5-device-entities.md)

## License

MIT
