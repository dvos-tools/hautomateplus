# Quick Examples

## Basic Setup

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});

await client.connect();
```

## Action Examples

### Lock System
```yaml
event: local-control
event_data:
  action: lock
  message: "System will be locked"
```

### Volume Control
```yaml
# Increase volume
event: local-control
event_data:
  action: volumeup
  message: "Volume up"

# Decrease volume
event: local-control
event_data:
  action: volumedown
  message: "Volume down"

# Mute
event: local-control
event_data:
  action: mute
  message: "Mute audio"

# Unmute
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
  message: "Hello from Home Assistant!"
```

### Shortcuts
```yaml
# Basic shortcut
event: local-control
event_data:
  action: shortcut
  message: "FocusMode"

# Shortcut with parameter
event: local-control
event_data:
  action: shortcut
  message: "ProcessText:Hello World"
``` 