# Home Assistant Local Control for macOS

A Node.js library that lets you control your Mac from Home Assistant. Lock your computer, adjust volume, show notifications - all triggered by your Home Assistant automations.

## What it does

- 🔗 Connects to Home Assistant via WebSocket
- 🖥️ Controls your Mac (lock, volume, notifications)
- 🔄 Auto-reconnects if connection drops
- ⚙️ Let's you enable/disable specific features
- 📊 Monitors connection health

## Quick Start

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});

```

## What you need

- **macOS** (uses native Swift CoreAudio for volume control, AppleScript for shortcuts and other features)
- **Node.js** 16+
- **Home Assistant** instance
- **Accessibility permissions** (macOS will prompt you)
- **Native binaries** (run `npm run build:all` to build the Swift volume control binaries)

## Supported Commands

- `lock` - Lock your computer (⌘+⌃+Q)
- `volumeup` / `volumedown` - Adjust volume
- `mute` / `unmute` - Control audio
- `notification` - Show system notifications
- `shortcut` - Trigger macOS Shortcuts

## Production & Background Processing

If you want to run this as a standalone service (not imported into your app), check out the [PM2 guide](./docs/4-pm2-setup.md).

### Background Process Management

The app includes enhanced reliability features for running as a background process:

- **Automatic reconnection** with exponential backoff
- **Health monitoring** with detailed connection statistics
- **Graceful shutdown** handling
- **Enhanced logging** with configurable levels
- **PM2 integration** with proper process management

### Testing & Monitoring

Use the included testing tools to verify and monitor your setup:

```bash
# Test connection to Home Assistant
npm run test:connection

# Monitor PM2-managed background process
npm run pm2:monitor

# View live logs
npm run pm2:logs
```

See the [testing documentation](./testing/README.md) for detailed troubleshooting guides.

## Docs

- [📖 Examples](./docs/3-quick-examples.md) - How to use the library
- [🏠 Home Assistant Setup](./docs/1-home-assistant-setup.md) - Configure Home Assistant
- [⚙️ Configuration](./docs/2-configuration.md) - Enable/disable features
- [🚀 PM2 Setup](./docs/4-pm2-setup.md) - Run as standalone service
- [🧪 Testing & Monitoring](./testing/README.md) - Troubleshooting and monitoring tools

## Permissions

macOS will ask for Accessibility permissions when you first use system control features. Just click "Allow" - it's needed to control your system. 
Or manually set them by going into Settings > Privacy & Security > Accessibility and enabling hautomateplus.

## Native Controls

### Volume Control

The volume control uses a native Swift binary for better performance and reliability. It intelligently detects the currently active output device for precise control. Before using volume control features:

1. Build the native binary: `npm run build:native`
2. The binary will be created at `native/volume/volume_control`
3. Volume control will automatically use the native implementation

### Shortcut Control

The shortcut control uses AppleScript to directly interact with the Shortcuts Events application. This provides a reliable way to execute any Shortcut from your Home Assistant automations without requiring native binaries. To use shortcut control features:

1. Create your shortcuts in the Shortcuts app
2. Use the exact shortcut name in your commands
3. The service automatically handles parameter escaping and AppleScript execution

**Example:**
```typescript
import { ShortcutService } from 'hautomateplus';

// Trigger a shortcut without parameters
await ShortcutService.trigger('MyShortcut');

// Trigger a shortcut with parameters
await ShortcutService.trigger('ProcessText', 'Hello from Home Assistant!');
```
