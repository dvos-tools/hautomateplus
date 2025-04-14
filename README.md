# Home Assistant Local Control

A Node.js library for integrating with Home Assistant and controlling your local system.

## Features

- Connect to Home Assistant via WebSocket
- Receive local control events from Home Assistant
- Execute system control commands based on events
- Monitor connection health and statistics

## Installation

```bash
npm install hautomateplus
```

## Usage

### Basic Setup

```typescript
import { HomeAssistantClient, SystemControlService } from 'hautomateplus';

// Create a client with your Home Assistant URL and access token
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for local control events
client.on('local_control_event', async (event) => {
  console.log('Local control event:', event);
  
  // Execute the appropriate system control command
  await SystemControlService.executeCommand(event.data);
});

// Close the client when done
client.close();
```

### System Control Commands

The `SystemControlService` provides the following system control commands:

- **Lock**: Lock your computer (Command+Control+Q)
- **VolumeUp**: Increase system volume
- **VolumeDown**: Decrease system volume
- **Mute**: Mute system audio
- **Unmute**: Unmute system audio
- **Notification**: Display a notification

### Volume Control

The `VolumeControl` utility provides native volume control without requiring AppleScript permissions:

```typescript
import { VolumeControl } from 'hautomateplus';

// Get current volume
const volume = await VolumeControl.getVolume();
console.log(`Current volume: ${volume}%`);

// Increase volume by 10
await VolumeControl.increaseVolume();

// Decrease volume by 5
await VolumeControl.decreaseVolume(5);

// Set volume to 50%
await VolumeControl.setVolume(50);

// Mute audio
await VolumeControl.setMute(true);

// Unmute audio
await VolumeControl.setMute(false);

// Toggle mute state
const isMuted = await VolumeControl.toggleMute();
console.log(`Audio is now ${isMuted ? 'muted' : 'unmuted'}`);
```

### Example: Local Control Event

```typescript
// Example event data from Home Assistant
const eventData = {
  action: 'lock',
  message: 'Locking computer from Home Assistant'
};

// Execute the command
await SystemControlService.executeCommand(eventData);
```

## Home Assistant Configuration

To use this library with Home Assistant, you need to:

1. Create a long-lived access token in Home Assistant
2. Set up an automation that triggers a local control event
3. Configure the event with the appropriate action and message

### Example Home Assistant Automation

```yaml
automation:
  - alias: "Lock Computer"
    trigger:
      - platform: event
        event_type: lock_computer
    action:
      - service: event.fire
        data:
          event_type: local-control
          event_data:
            action: lock
            message: "Locking computer from Home Assistant"
```

## API Reference

### HomeAssistantClient

```typescript
class HomeAssistantClient extends EventEmitter {
  constructor(url: string, accessToken: string);
  close(): void;
  getConnectionHealth(): ConnectionHealth;
}
```

### SystemControlService

```typescript
class SystemControlService {
  static executeCommand(eventData: LocalControlEventData): Promise<void>;
  static executeLockCommand(message?: string): Promise<void>;
  static executeNotificationCommand(message: string): Promise<void>;
}
```

### VolumeControl

```typescript
class VolumeControl {
  static getVolume(): Promise<number>;
  static setVolume(level: number): Promise<void>;
  static increaseVolume(amount?: number): Promise<void>;
  static decreaseVolume(amount?: number): Promise<void>;
  static setMute(mute: boolean): Promise<void>;
  static toggleMute(): Promise<boolean>;
}
```
