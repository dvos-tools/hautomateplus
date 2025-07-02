# Native Volume Control

This directory contains a native Swift implementation for controlling macOS system volume using the CoreAudio framework.

## Features

- **Volume Up/Down**: Increase or decrease volume by specified amounts
- **Set Volume**: Set volume to a specific level (0-100)
- **Mute/Unmute**: Control audio mute state
- **Toggle Mute**: Toggle between muted and unmuted states
- **Get Volume**: Retrieve current volume level
- **Smart Device Detection**: Automatically finds the currently active output device

## Building

To build the native binary:

```bash
npm run build:native
```

This will:
1. Use Swift Package Manager to compile the Swift code
2. Create a release build
3. Copy the binary to `native/volume/volume_control`

For universal binary (both ARM64 and x86_64):
```bash
npm run build:native:universal
```

## Usage

The binary can be used directly from command line:

```bash
# Get current volume
./native/volume/volume_control get

# Set volume to 50%
./native/volume/volume_control set 50

# Increase volume by 10
./native/volume/volume_control up 10

# Decrease volume by 5
./native/volume/volume_control down 5

# Mute audio
./native/volume/volume_control mute

# Unmute audio
./native/volume/volume_control unmute

# Toggle mute state
./native/volume/volume_control toggle
```

## TypeScript Integration

The `VolumeControl` class provides a TypeScript interface:

```typescript
import { VolumeControl } from './utils/volumeControl';

// Check if native binary is available
const isAvailable = await VolumeControl.isAvailable();

// Get current volume
const volume = await VolumeControl.getVolume();

// Set volume to 75%
await VolumeControl.setVolume(75);

// Increase volume by 10
await VolumeControl.increaseVolume(10);

// Decrease volume by 5
await VolumeControl.decreaseVolume(5);

// Mute audio
await VolumeControl.mute();

// Unmute audio
await VolumeControl.unmute();

// Toggle mute
const isMuted = await VolumeControl.toggleMute();
```

## Advantages over AppleScript

- **Performance**: Direct CoreAudio API calls are faster than AppleScript
- **Reliability**: No dependency on AppleScript execution
- **Precision**: Direct control over audio properties
- **Error Handling**: Better error reporting and handling
- **Smart Device Selection**: Automatically detects and uses the currently active output device

## Requirements

- macOS 10.15 or later
- Xcode Command Line Tools (for building)
- Swift 5.9 or later

## Permissions

The binary may require accessibility permissions to control system volume. macOS will prompt for permissions when first used. 