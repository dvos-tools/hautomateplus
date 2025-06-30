# 3. Quick Examples

Here's how to use the library in your own Node.js app.

## Basic Usage

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

// Connect to Home Assistant
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for events and execute commands
client.on('local_control_event', async (event) => {
  await SystemControlService.executeCommand(event.data);
});
```

## Volume Control

```typescript
import { VolumeControl } from 'hautomateplus';

// Get current volume
const volume = await VolumeControl.getVolume();
console.log(`Volume: ${volume}%`);

// Adjust volume
await VolumeControl.setVolume(50);
await VolumeControl.increaseVolume(10);
await VolumeControl.decreaseVolume(5);

// Mute control
await VolumeControl.setMute(true);
await VolumeControl.toggleMute();
```

## Configuration

```typescript
import { 
  getSystemControlConfig, 
  setEndpointEnabled,
  updateSystemControlConfig 
} from 'hautomateplus';

// Disable specific features
setEndpointEnabled('lock', false);
setEndpointEnabled('notification', false);

// Or update multiple at once
updateSystemControlConfig({
  volumeUp: true,
  volumeDown: true,
  lock: false,
  notification: false
});

// Check current config
const config = getSystemControlConfig();
console.log(config);
```

## Connection Health

```typescript
import { HomeAssistantClient } from 'hautomateplus';

const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Get health info
const health = client.getConnectionHealth();
const stats = client.getConnectionStats();

console.log('Healthy:', health.isHealthy);
console.log('Quality:', health.connectionQuality);
console.log('Latency:', health.latency);
console.log('Total connections:', stats.totalConnections);
```

## Supported Commands

When Home Assistant sends a `local-control` event, you can execute these actions:

- `lock` - Lock your computer
- `volumeup` - Increase volume
- `volumedown` - Decrease volume  
- `mute` - Mute audio
- `unmute` - Unmute audio
- `notification` - Show notification

## Event Format

Home Assistant should send events like this:

```json
{
  "event_type": "local-control",
  "event_data": {
    "action": "lock",
    "message": "Locking computer"
  }
}
```

## Error Handling

```typescript
client.on('local_control_event', async (event) => {
  try {
    await SystemControlService.executeCommand(event.data);
    console.log('Command executed successfully');
  } catch (error) {
    console.error('Failed to execute command:', error);
  }
});

client.on('error', (error) => {
  console.error('Connection error:', error);
});
```

## Complete Example

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

async function startLocalControl() {
  const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);
  
  client.on('local_control_event', async (event) => {
    console.log('Received:', event.data.action);
    await SystemControlService.executeCommand(event.data);
  });
  
  client.on('error', (error) => {
    console.error('Error:', error);
  });
  
  // Keep the process running
  process.on('SIGINT', () => {
    client.close();
    process.exit(0);
  });
}

startLocalControl();
```

That's it! The library handles the WebSocket connection, reconnection, and system control for you. 