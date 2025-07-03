# Interactive Notifications Control

This module provides native macOS interactive notifications with text input capabilities using Swift and the UserNotifications framework.

## Features

- **Basic Notifications**: Display simple system notifications
- **Interactive Notifications**: Show notifications with text input fields
- **Permission Management**: Request and check notification permissions
- **Response Handling**: Capture user input from interactive notifications
- **Timeout Support**: Handle notification timeouts gracefully
- **Category Management**: List and manage notification categories

## Building

To build the native binary:

```bash
# Build for current architecture
npm run build:native

# Build universal binary (Intel + Apple Silicon)
npm run build:native:universal
```

## Usage

### Basic Notifications

```typescript
import { NotificationService } from '../services/NotificationService';

// Display a basic notification
await NotificationService.displayNotification(
  'Your message here',
  'Notification Title',
  'Optional subtitle'
);
```

### Interactive Notifications

```typescript
// Display an interactive notification with text input
const response = await NotificationService.displayInteractiveNotification({
  title: 'Input Required',
  message: 'Please enter your response:',
  subtitle: 'This notification has a text input field',
  placeholder: 'Enter text here...',
  buttonText: 'Submit',
  timeout: 30000 // 30 seconds
});

console.log('User input:', response.userText);
```

### Permission Management

```typescript
// Check current permission status
const status = await NotificationService.checkPermission();
console.log('Permission status:', status); // 'authorized', 'denied', 'notDetermined', etc.

// Request permission if needed
if (status === 'notDetermined') {
  await NotificationService.requestPermission();
}
```

### Integration with Home Assistant

```typescript
// Example: Get user input for thermostat temperature
const response = await NotificationService.displayInteractiveNotification({
  title: 'Home Assistant Command',
  message: 'Enter the temperature for your thermostat:',
  placeholder: 'Enter temperature (e.g., 72)',
  buttonText: 'Set Temperature',
  timeout: 30000
});

// Send the response back to Home Assistant
await homeAssistantClient.callService('climate', 'set_temperature', {
  entity_id: 'climate.living_room',
  temperature: parseFloat(response.userText)
});
```

### Local Processing

```typescript
// Example: Execute local commands
const response = await NotificationService.displayInteractiveNotification({
  title: 'System Command',
  message: 'Enter a command to execute:',
  placeholder: 'e.g., ls -la, pwd, whoami',
  buttonText: 'Execute',
  timeout: 30000
});

// Execute the command locally
const { exec } = require('child_process');
exec(response.userText, (error, stdout, stderr) => {
  if (error) {
    console.error('Command execution error:', error);
    return;
  }
  console.log('Command output:', stdout);
});
```

## API Reference

### NotificationService.displayNotification(message, title?, subtitle?, category?)

Display a basic system notification.

- `message` (string): The notification message
- `title` (string, optional): The notification title (default: 'System Control')
- `subtitle` (string, optional): The notification subtitle
- `category` (string, optional): The notification category

### NotificationService.displayInteractiveNotification(options)

Display an interactive notification with text input.

**Options:**
- `title` (string): The notification title
- `message` (string): The notification message
- `subtitle` (string, optional): The notification subtitle
- `placeholder` (string, optional): Placeholder text for the input field (default: 'Enter text...')
- `buttonText` (string, optional): Text for the submit button (default: 'Submit')
- `timeout` (number, optional): Timeout in milliseconds (default: 30000)

**Returns:** Promise<NotificationResponse>

**NotificationResponse:**
- `notificationId` (string): Unique identifier for the notification
- `timestamp` (number): Unix timestamp when the response was received
- `userText` (string): The text entered by the user

### NotificationService.checkPermission()

Check the current notification permission status.

**Returns:** Promise<string> - One of: 'authorized', 'denied', 'notDetermined', 'provisional', 'ephemeral', 'unknown'

### NotificationService.requestPermission()

Request notification permissions from the user.

### NotificationService.listCategories()

List all registered notification categories.

### NotificationService.clearAllNotifications()

Clear all delivered notifications.

### NotificationService.isAvailable()

Check if the native binary is available and executable.

**Returns:** Promise<boolean>

## Error Handling

The service handles various error conditions:

- **Timeout**: When no response is received within the specified timeout
- **Cancellation**: When the user cancels the notification
- **Permission Denied**: When notification permissions are not granted
- **Binary Not Found**: When the native binary is not available

```typescript
try {
  const response = await NotificationService.displayInteractiveNotification({
    title: 'Test',
    message: 'Enter something:',
    timeout: 10000
  });
  console.log('Response:', response.userText);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Notification timed out');
  } else if (error.message.includes('cancelled')) {
    console.log('User cancelled the notification');
  } else {
    console.error('Other error:', error);
  }
}
```

## Permissions

On macOS, the application needs notification permissions to display notifications. The system will prompt the user to grant permission when notifications are first used.

To manually grant permissions:
1. Go to System Preferences > Notifications & Focus
2. Find your application in the list
3. Enable notifications for the application

## Technical Details

The implementation uses:
- **UNUserNotificationCenter**: For managing notifications
- **UNTextInputNotificationAction**: For text input capabilities
- **UNNotificationCategory**: For organizing notification actions
- **UNNotificationDelegate**: For handling user responses

The Swift binary communicates with the TypeScript service through stdout, using a specific format for responses:
- `NOTIFICATION_RESPONSE:<id>:<timestamp>:<user_text>`
- `NOTIFICATION_CANCELLED`

## Examples

See `src/examples/06-interactive-notifications.ts` for comprehensive examples of all features. 