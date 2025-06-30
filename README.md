# Home Assistant Local Control for macOS

A Node.js library that lets you control your Mac from Home Assistant. Lock your computer, adjust volume, show notifications - all triggered by your Home Assistant automations.

## What it does

- 🔗 Connects to Home Assistant via WebSocket
- 🖥️ Controls your Mac (lock, volume, notifications)
- 🔄 Auto-reconnects if connection drops
- ⚙️ Let's you enable/disable specific features
- 📊 Monitors connection health

## Quick Start

```bash
npm install hautomateplus
```

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});
```

## What you need

- **macOS** (uses AppleScript for system control)
- **Node.js** 16+
- **Home Assistant** instance
- **Accessibility permissions** (macOS will prompt you)

## Supported Commands

- `lock` - Lock your computer (⌘+⌃+Q)
- `volumeup` / `volumedown` - Adjust volume
- `mute` / `unmute` - Control audio
- `notification` - Show system notifications

## Production

If you want to run this as a standalone service (not imported into your app), check out the [PM2 guide](./docs/PM2_USAGE.md).

## Docs

- [📖 Examples](./docs/3-quick-examples.md) - How to use the library
- [🏠 Home Assistant Setup](./docs/1-home-assistant-setup.md) - Configure Home Assistant
- [⚙️ Configuration](./docs/2-configuration.md) - Enable/disable features
- [🚀 PM2 Setup](./docs/4-pm2-setup.md) - Run as standalone service

## Permissions

macOS will ask for Accessibility permissions when you first use system control features. Just click "Allow" - it's needed to control your system. 
Or manually set them by going into Settings > Privacy & Security > Accessibility and enabling hautomateplus.
