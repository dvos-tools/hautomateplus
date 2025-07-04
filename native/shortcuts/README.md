# Native Shortcut Control

This directory contains a native Swift implementation for triggering macOS Shortcuts from the command line.

## Features

- **Trigger Shortcuts**: Execute any macOS Shortcut by name
- **Parameter Support**: Pass parameters to shortcuts that accept input
- **Error Handling**: Proper error reporting for failed operations
- **URL Encoding**: Automatic encoding of special characters in parameters

## Building

To build the native binary:

```bash
npm run build:native
```

This will:
1. Use Swift Package Manager to compile the Swift code
2. Create a release build
3. Copy the binary to `native/shortcuts/shortcut_control`

For universal binary (both ARM64 and x86_64):
```bash
npm run build:native:universal
```

## Usage

The binary can be used directly from command line:

```bash
# Trigger a shortcut without parameters
./native/shortcuts/shortcut_control MyShortcut

# Trigger a shortcut with a parameter
./native/shortcuts/shortcut_control MyShortcut "Hello World"

# Trigger a shortcut with special characters (automatically encoded)
./native/shortcuts/shortcut_control ProcessText "Text with spaces & symbols!"
```

## TypeScript Integration

The `ShortcutControl` class provides a TypeScript interface:

```typescript
import { ShortcutControl } from './utils/shortcutControl';

// Check if native binary is available
const isAvailable = await ShortcutControl.isAvailable();

// Trigger a shortcut without parameters
await ShortcutControl.trigger('MyShortcut');

// Trigger a shortcut with parameters
await ShortcutControl.trigger('ProcessText', 'Hello from TypeScript!');
```

## Shortcut Setup

To use this with your shortcuts:

1. **Create a Shortcut** in the Shortcuts app
2. **Name it** (this is the name you'll use in the command)
3. **Add Input Parameter** (optional) - if your shortcut accepts input, it will receive the parameter
4. **Test the Shortcut** manually first to ensure it works

## URL Scheme

The implementation uses the `shortcuts://` URL scheme:
- `shortcuts://run-shortcut?name=ShortcutName` (no parameters)
- `shortcuts://run-shortcut?name=ShortcutName&input=Parameter` (with parameters)

## Requirements

- macOS 10.15 or later
- Xcode Command Line Tools (for building)
- Swift 5.9 or later
- Shortcuts app installed

## Permissions

The binary may require accessibility permissions to trigger shortcuts. macOS will prompt for permissions when first used. 