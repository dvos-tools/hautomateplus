# Documentation

Quick guides for using the Home Assistant Local Control library.

## Guides

1. **[Home Assistant Setup](./1-home-assistant-setup.md)** - Configure Home Assistant
2. **[Configuration](./2-configuration.md)** - Enable/disable features
3. **[Quick Examples](./3-quick-examples.md)** - How to use the library in your code
4. **[PM2 Setup](./4-pm2-setup.md)** - Run as standalone service

## What This Library Does

It's a **Node.js library** that connects your Mac to Home Assistant. When Home Assistant sends events, your Mac executes commands like:
- Lock the computer
- Adjust volume
- Show notifications
- Mute/unmute audio

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

## What You Need

- **macOS** (uses native Swift CoreAudio for volume control, AppleScript for other features)
- **Node.js** 16+
- **Home Assistant** instance
- **Accessibility permissions** (macOS will prompt)
- **Native binary** (run `npm run build:native` for volume control)

## Two Ways to Use

1. **Import into your app** - Use the library in your own Node.js project
2. **Run as standalone service** - Use PM2 to run it independently

Start with the [Quick Examples](./3-quick-examples.md) to see how it works! 