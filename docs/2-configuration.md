# 2. Configuration

How to enable/disable specific features.

## Quick Config

```typescript
import { setEndpointEnabled } from 'hautomateplus';

// Disable lock feature
setEndpointEnabled('lock', false);

// Disable notifications
setEndpointEnabled('notification', false);
```

## All Options

```typescript
import { updateSystemControlConfig } from 'hautomateplus';

updateSystemControlConfig({
  volumeUp: true,      // Enable volume up
  volumeDown: true,    // Enable volume down
  mute: true,          // Enable mute
  unmute: true,        // Enable unmute
  lock: false,         // Disable lock
  notification: false  // Disable notifications
});
```

## Check Current Config

```typescript
import { getSystemControlConfig } from 'hautomateplus';

const config = getSystemControlConfig();
console.log(config);
// { volumeUp: true, volumeDown: true, mute: true, unmute: true, lock: false, notification: false }
```

## Disable Everything

```typescript
import { updateSystemControlConfig } from 'hautomateplus';

updateSystemControlConfig({
  volumeUp: false,
  volumeDown: false,
  mute: false,
  unmute: false,
  lock: false,
  notification: false
});
```

## Enable Everything

```typescript
import { updateSystemControlConfig } from 'hautomateplus';

updateSystemControlConfig({
  volumeUp: true,
  volumeDown: true,
  mute: true,
  unmute: true,
  lock: true,
  notification: true
});
```

## What Happens When Disabled?

When a feature is disabled, the library will:
- Log a warning: `"Lock endpoint is disabled"`
- Skip the command execution
- Continue running normally

## Use Cases

- **Security**: Disable `lock` in public spaces
- **Privacy**: Disable `notification` to avoid popups
- **Testing**: Disable features while testing others
- **Restrictions**: Disable volume control in certain environments

That's it! Simple on/off switches for each feature. 