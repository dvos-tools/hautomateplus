# Home Assistant Local Control for macOS

Control your Mac from Home Assistant via WebSocket connection.

## Quick Start

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});
```

## Requirements

- **macOS** with Node.js 16+
- **Home Assistant** instance
- **Accessibility permissions** (macOS will prompt you)
- **Native volume binary**: `npm run build:native`

## Supported Actions

### Lock System
```yaml
event: local-control
event_data:
  action: lock
  message: "System will be locked"
```

### Volume Control
```yaml
event: local-control
event_data:
  action: volumeup
  message: "Increase volume"

event: local-control
event_data:
  action: volumedown
  message: "Decrease volume"

event: local-control
event_data:
  action: mute
  message: "Mute audio"

event: local-control
event_data:
  action: unmute
  message: "Unmute audio"
```

### Notifications
```yaml
event: local-control
event_data:
  action: notification
  message: "Your notification message here"
```

### Shortcuts
```yaml
event: local-control
event_data:
  action: shortcut
  message: "ShortcutName"

# With parameter
event: local-control
event_data:
  action: shortcut
  message: "ShortcutName:parameter"
```

## Setup

1. Install: `npm install`
2. Build: `npm run build:all`
3. Start: `npm start`

## Permissions

macOS will ask for Accessibility permissions when first used. Grant them in Settings > Privacy & Security > Accessibility.
