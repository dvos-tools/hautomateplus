# Examples

This directory contains example scripts demonstrating how to use the Home Assistant Local Control library.

## Example Scripts

### 01-basic-connection.ts
**Purpose**: Basic WebSocket connection to Home Assistant
- Establishes connection to Home Assistant
- Handles connection events
- Demonstrates basic event handling

**Run**: `npm run build && node dist/examples/01-basic-connection.js`

### 02-system-control.ts
**Purpose**: System control functionality
- Listens for local-control events
- Executes system commands (volume, brightness, notifications, locks)
- Shows basic event handling

**Run**: `npm run build && node dist/examples/02-system-control.js`

### 03-volume-control.ts
**Purpose**: Volume control demonstration
- Shows how to control system volume
- Demonstrates volume up/down, mute/unmute
- Uses native Swift binary for reliable control

**Run**: `npm run build && node dist/examples/03-volume-control.js`

### 04-configuration.ts
**Purpose**: Configuration management
- Loads configuration from YAML files
- Shows how to enable/disable features
- Demonstrates configuration validation

**Run**: `npm run build && node dist/examples/04-configuration.js`

### 05-full-app.ts
**Purpose**: Complete application example
- Full-featured application with all capabilities
- System control, device entities, custom entities
- PM2-ready with proper error handling
- Loads configuration from config.yaml

**Run**: `npm run build && node dist/examples/05-full-app.js`

### 06-shortcut-control.ts
**Purpose**: Shortcut control demonstration
- Shows how to trigger macOS shortcuts
- Demonstrates parameter passing
- Uses native Swift binary for reliable execution

**Run**: `npm run build && node dist/examples/06-shortcut-control.js`

### 07-device-entities.ts
**Purpose**: Device entity management
- Creates and updates device status entities
- Shows battery, connection status, device name
- Demonstrates periodic updates

**Run**: `npm run build && node dist/examples/07-device-entities.js`

### 08-custom-entities.ts
**Purpose**: Custom entities from shortcuts
- Creates custom entities from macOS shortcuts
- Reads shortcut output files
- Syncs data to Home Assistant
- Loads configuration from config.yaml

**Run**: `npm run example:custom-entities`

## Running Examples

### Prerequisites
1. Set up environment variables in `.env`:
   ```
   HA_URL=ws://your-ha-instance:8123/api/websocket
   HA_ACCESS_TOKEN=your-access-token
   ```

2. Build the project:
   ```bash
   npm run build:all
   ```

### Quick Start
Start with the basic connection example to verify your setup:
```bash
npm run build && node dist/examples/01-basic-connection.js
```

### Production Ready
For production use, run the full application example:
```bash
npm run build && node dist/examples/05-full-app.js
```

## Configuration

Most examples use the `config.yaml` file for configuration. Create this file in your project root:

```yaml
# System Control Configuration
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
    - name: "Focus Mode"
      shortcutName: "FocusMode"
      filePath: "~/hautomateplus/focus_mode_output.txt"
      entityType: "sensor"
      deviceClass: "enum"
```

## Troubleshooting

### Common Issues

1. **Connection failed**
   - Check your `HA_URL` and `HA_ACCESS_TOKEN`
   - Verify Home Assistant is accessible
   - Check firewall settings

2. **Native binaries not found**
   - Run `npm run build:native` to build Swift binaries
   - Check that binaries exist in `native/volume/volume_control` and `native/shortcuts/shortcut_control`

3. **Permission errors**
   - Grant accessibility permissions to Terminal/Node.js
   - Check that shortcuts exist with the specified names

4. **Custom entities not appearing**
   - Verify shortcut names match exactly
   - Check that shortcuts write to the specified file paths
   - Ensure the config.yaml is properly formatted

## Next Steps

After running the examples:
1. **Customize**: Modify the examples for your specific needs
2. **Production**: Use PM2 for production deployment
3. **Integration**: Integrate into your existing Home Assistant setup
4. **Automation**: Create Home Assistant automations using the entities 