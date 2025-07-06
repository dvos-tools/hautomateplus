# Device Entities

This document explains how to use the device entity functionality to expose device information (battery status, connection status, device name) to Home Assistant.

## Overview

The device entity service allows your macOS device to expose its status information to Home Assistant as entities. This includes:

- **Connection Status**: Whether the device is connected to Home Assistant
- **Battery Level**: Current battery percentage (for laptops)
- **Battery Charging**: Whether the battery is currently charging (for laptops)
- **Device Name**: The hostname of the device

## How It Works

The system uses the existing WebSocket connection to Home Assistant to:
1. Create entities when the service starts
2. Update entity states periodically (every 30 seconds by default)
3. Update connection status in real-time when the connection changes

## Entity Types

### Binary Sensor: Connection Status
- **Entity ID**: `binary_sensor.{device_name}_connection`
- **State**: `on` (connected) or `off` (disconnected)
- **Device Class**: `connectivity`
- **Icon**: `mdi:connection`

### Sensor: Battery Level
- **Entity ID**: `sensor.{device_name}_battery_level`
- **State**: Battery percentage (0-100)
- **Device Class**: `battery`
- **Unit**: `%`
- **Icon**: `mdi:battery`

### Binary Sensor: Battery Charging
- **Entity ID**: `binary_sensor.{device_name}_battery_charging`
- **State**: `on` (charging) or `off` (not charging)
- **Device Class**: `battery_charging`
- **Icon**: `mdi:battery-charging`

### Sensor: Device Name
- **Entity ID**: `sensor.{device_name}_device_name`
- **State**: Device hostname
- **Icon**: `mdi:desktop-mac`

## Usage

### Basic Setup

```typescript
import { HomeAssistantClient } from './client/HomeAssistantClient';
import { DeviceEntityService } from './services/deviceEntityService';

// Create Home Assistant client
const client = new HomeAssistantClient(HA_URL, HA_TOKEN);

// Create device entity service
const deviceEntityService = new DeviceEntityService(client.getWebSocket());

// Initialize and create entities
await deviceEntityService.initialize();
await deviceEntityService.createEntities();

// Start periodic updates
deviceEntityService.startPeriodicUpdates(30000); // Update every 30 seconds
```

### Complete Example

See `src/examples/07-device-entities.ts` for a complete working example.

### Testing Device Information

Test the device information gathering functionality:

```bash
npm run build
npm run test:device-info
```

This will show:
- Device name
- Battery level and charging status
- Whether the device has a battery
- Complete device information

## Configuration

### Environment Variables

- `HA_URL`: Home Assistant WebSocket URL (default: `ws://localhost:8123/api/websocket`)
- `HA_TOKEN`: Home Assistant access token (required)

### Update Intervals

The default update interval is 30 seconds. You can customize this:

```typescript
// Update every 60 seconds
deviceEntityService.startPeriodicUpdates(60000);

// Stop updates
deviceEntityService.stopPeriodicUpdates();
```

## Home Assistant Integration

### Entity Registration

Entities are automatically created when the service starts. They will appear in Home Assistant with the device name as a prefix.

### Example Entity Names

If your device name is `MacBook-Pro`, the entities will be:
- `binary_sensor.macbook_pro_connection`
- `sensor.macbook_pro_battery_level`
- `binary_sensor.macbook_pro_battery_charging`
- `sensor.macbook_pro_device_name`

### Using Entities in Automations

You can use these entities in Home Assistant automations:

```yaml
# Example automation: Notify when battery is low
automation:
  - alias: "Low Battery Alert"
    trigger:
      platform: numeric_state
      entity_id: sensor.macbook_pro_battery_level
      below: 20
    action:
      - service: notify.mobile_app
        data:
          message: "Battery is low on MacBook Pro"

# Example automation: Notify when device disconnects
automation:
  - alias: "Device Disconnected"
    trigger:
      platform: state
      entity_id: binary_sensor.macbook_pro_connection
      to: "off"
    action:
      - service: notify.mobile_app
        data:
          message: "MacBook Pro disconnected from Home Assistant"
```

## Troubleshooting

### Entity Not Appearing

1. Check that the service is running and connected to Home Assistant
2. Verify that the device name is valid (no special characters)
3. Check Home Assistant logs for any errors

### Battery Information Not Available

- Desktop Macs don't have batteries, so battery entities won't be created
- The service automatically detects if a battery is present

### Connection Status Not Updating

1. Check the WebSocket connection status
2. Verify that the service has proper permissions
3. Check the logs for any connection errors

### Permission Issues

The service needs access to system information. On macOS, you may need to grant permissions:

1. Go to System Preferences > Security & Privacy > Privacy
2. Add your application to the appropriate categories (Accessibility, etc.)
3. Restart the application

## API Reference

### DeviceInfoService

```typescript
class DeviceInfoService {
  static getDeviceName(): Promise<string>
  static getBatteryInfo(): Promise<BatteryInfo>
  static getDeviceInfo(isConnected?: boolean): Promise<DeviceInfo>
  static hasBattery(): Promise<boolean>
}
```

### DeviceEntityService

```typescript
class DeviceEntityService {
  constructor(ws: HomeAssistantWebSocket)
  
  initialize(): Promise<void>
  createEntities(): Promise<void>
  updateEntityStates(isConnected?: boolean): Promise<void>
  startPeriodicUpdates(interval?: number): void
  stopPeriodicUpdates(): void
  updateConnectionStatus(isConnected: boolean): Promise<void>
  getEntityIds(): DeviceEntities | null
  cleanup(): void
}
```

## Limitations

- Battery information is only available on laptops with batteries
- Device name is based on the system hostname
- Connection status updates depend on WebSocket connection health
- Entity creation requires the service to be running

## Future Enhancements

Potential improvements:
- Additional device information (CPU usage, memory, disk space)
- Custom entity attributes
- Configurable update intervals per entity type
- Entity state history
- Integration with Home Assistant device registry 