# Custom Entities

This document explains how to create custom entities in Home Assistant that get their values from macOS shortcuts.

## Overview

Custom entities allow you to create sensors in Home Assistant that are populated by running macOS shortcuts. The shortcuts write their output to files, and the app reads those files and syncs the values to Home Assistant.

## How It Works

1. **Configuration**: Define custom entities in a YAML configuration file
2. **Shortcut Execution**: The app runs the specified shortcuts periodically
3. **File Reading**: Shortcuts write their output to specified file paths
4. **Entity Updates**: The app reads the files and updates Home Assistant entities
5. **Device Integration**: All entities are created under the same device as other system entities

## Configuration

### YAML Configuration File

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

### Entity Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | string | Yes | Display name for the entity |
| `shortcutName` | string | Yes | Name of the macOS shortcut to run |
| `filePath` | string | Yes | Path where the shortcut writes its output |
| `entityType` | string | No | Entity type (`sensor`, `binary_sensor`) |
| `unitOfMeasurement` | string | No | Unit of measurement (e.g., `°C`, `%`) |
| `deviceClass` | string | No | Home Assistant device class |
| `stateClass` | string | No | Home Assistant state class |

## Creating macOS Shortcuts

For each custom entity, you need to create a corresponding shortcut in the macOS Shortcuts app:

### Example: MyShortcut

1. Open the Shortcuts app
2. Create a new shortcut
3. Name it exactly "MyShortcut"
4. Add actions to generate your desired value
5. Add a "Save File" action to write to `~/hautomateplus/my_shortcut_output.txt`

### Example: GetTemperature

1. Create a shortcut named "GetTemperature"
2. Add actions to get temperature data (e.g., from a weather API)
3. Add a "Save File" action to write to `~/hautomateplus/temperature_output.txt`

### Example: CheckBattery

1. Create a shortcut named "CheckBattery"
2. Add actions to check battery status
3. Add a "Save File" action to write to `~/hautomateplus/battery_output.txt`

## Usage

### Basic Setup

```typescript
import { DeviceEntityService } from './src/index';

// Create device entity service
const deviceEntityService = new DeviceEntityService();

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

// Initialize with custom entities
await deviceEntityService.initialize(customEntityConfig);

// Start periodic updates (includes custom entities)
deviceEntityService.startPeriodicUpdates();
```

### Full Application Example

```typescript
import { HomeAssistantClient, DeviceEntityService } from './src/index';

async function startApp() {
  // Create Home Assistant client
  const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);
  
  // Create device entity service
  const deviceEntityService = new DeviceEntityService();
  
  // Load custom entity configuration
  const customEntityConfig = await loadCustomEntityConfig();
  
  // Initialize with custom entities
  await deviceEntityService.initialize(customEntityConfig);
  
  // Start periodic updates
  deviceEntityService.startPeriodicUpdates();
  
  // Set up event listeners
  client.on('local_control_event', async (event) => {
    await SystemControlService.executeCommand(event.data);
  });
}

startApp();
```

## Entity Structure

All custom entities are created under the same device as other system entities:

### Entity IDs

Custom entities follow the naming pattern: `{entityType}.{deviceName}_{entityName}`

Examples:
- `sensor.hautomateplus_mysensor`
- `sensor.hautomateplus_temperature`
- `sensor.hautomateplus_batterystatus`

### Device Integration

All entities share the same device ID (`hautomateplus_device`) and are grouped together in Home Assistant with:

- **Device Name**: `hautomateplus`
- **Manufacturer**: `hautomateplus`
- **Model**: `Local Automation Extension`
- **Software Version**: `1.0.0`

## File Paths

### Home Directory Expansion

File paths starting with `~` are automatically expanded to the user's home directory:

```yaml
filePath: "~/hautomateplus/my_shortcut_output.txt"
# Expands to: /Users/username/hautomateplus/my_shortcut_output.txt
```

### Recommended Structure

Create a dedicated directory for shortcut output files:

```bash
mkdir ~/hautomateplus
```

This keeps your shortcut outputs organized and separate from other files.

## Update Frequency

Custom entities are updated every 30 seconds by default, along with device status entities. This interval can be configured:

```typescript
// Update every 60 seconds
deviceEntityService.startPeriodicUpdates(60000);
```

## Error Handling

The service handles various error conditions gracefully:

- **Shortcut not found**: Entity state set to "error"
- **File not found**: Entity state set to "unknown"
- **File read error**: Entity state set to "error"
- **Shortcut execution error**: Entity state set to "error"

## Troubleshooting

### Entity Not Appearing

1. Check that the shortcut name matches exactly
2. Verify the file path is correct
3. Ensure the shortcut writes to the specified file
4. Check the app logs for error messages

### Entity State Not Updating

1. Verify the shortcut is writing to the correct file
2. Check file permissions
3. Ensure the file contains valid data
4. Check the app logs for update errors

### Shortcut Not Running

1. Verify the shortcut name in the Shortcuts app
2. Test the shortcut manually in the Shortcuts app
3. Check that the native binary is built: `npm run build:native`
4. Verify accessibility permissions

## Advanced Configuration

### Multiple Entities

You can configure multiple entities in the same configuration:

```yaml
customEntities:
  enabled: true
  entities:
    - name: "CPU Temperature"
      shortcutName: "GetCPUTemperature"
      filePath: "~/hautomateplus/cpu_temp.txt"
      entityType: "sensor"
      unitOfMeasurement: "°C"
      deviceClass: "temperature"
    
    - name: "Memory Usage"
      shortcutName: "GetMemoryUsage"
      filePath: "~/hautomateplus/memory_usage.txt"
      entityType: "sensor"
      unitOfMeasurement: "%"
      deviceClass: "generic"
    
    - name: "Network Status"
      shortcutName: "CheckNetwork"
      filePath: "~/hautomateplus/network_status.txt"
      entityType: "binary_sensor"
      deviceClass: "connectivity"
```

### Different Entity Types

You can create different types of entities:

```yaml
entities:
  # Regular sensor
  - name: "Temperature"
    shortcutName: "GetTemperature"
    filePath: "~/hautomateplus/temp.txt"
    entityType: "sensor"
    unitOfMeasurement: "°C"
    deviceClass: "temperature"
  
  # Binary sensor (on/off)
  - name: "System Online"
    shortcutName: "CheckSystemStatus"
    filePath: "~/hautomateplus/system_status.txt"
    entityType: "binary_sensor"
    deviceClass: "connectivity"
```

## Integration with Home Assistant

### Automations

You can create automations based on custom entity values:

```yaml
automation:
  - alias: "High Temperature Alert"
    trigger:
      platform: numeric_state
      entity_id: sensor.hautomateplus_temperature
      above: 80
    action:
      - service: notify.mobile_app
        data:
          message: "High temperature detected: {{ states('sensor.hautomateplus_temperature') }}°C"
```

### Dashboards

Add custom entities to your Home Assistant dashboard:

```yaml
type: entities
entities:
  - entity: sensor.hautomateplus_temperature
    name: "CPU Temperature"
  - entity: sensor.hautomateplus_mysensor
    name: "My Custom Sensor"
```

## Best Practices

1. **Use descriptive names**: Choose clear, descriptive names for your entities
2. **Organize files**: Keep shortcut output files in a dedicated directory
3. **Test shortcuts**: Verify shortcuts work manually before adding to configuration
4. **Monitor logs**: Check app logs for any errors or issues
5. **Backup configuration**: Keep your `config.yaml` file backed up
6. **Use appropriate device classes**: Choose the right device class for your entity type

## Examples

See the following examples for complete implementations:

- [Custom Entities Example](src/examples/08-custom-entities.ts) - Basic custom entities setup
- [Full Application Example](src/examples/05-full-app.ts) - Complete application with custom entities
- [Configuration Examples](config.yaml) - Sample configuration file 