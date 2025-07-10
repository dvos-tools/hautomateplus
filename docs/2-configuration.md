# Configuration

## Enable/Disable Actions

You can disable specific actions in your code:

```typescript
import { setEndpointEnabled } from 'hautomateplus';

// Disable lock functionality
setEndpointEnabled('lock', false);

// Disable volume control
setEndpointEnabled('volumeUp', false);
setEndpointEnabled('volumeDown', false);

// Disable notifications
setEndpointEnabled('notification', false);

// Disable shortcuts
setEndpointEnabled('shortcut', false);
```

## Environment Variables

Create a `.env` file:

```env
HA_URL=ws://192.168.1.100:8123/api/websocket
HA_ACCESS_TOKEN=your_long_lived_access_token
```

## Available Actions

- `lock` - Lock system
- `volumeup` - Increase volume
- `volumedown` - Decrease volume
- `mute` - Mute audio
- `unmute` - Unmute audio
- `notification` - Show notification
- `shortcut` - Trigger shortcut 