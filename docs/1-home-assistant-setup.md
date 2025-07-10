# Home Assistant Setup

## 1. Add to configuration.yaml

```yaml
# Add this to your configuration.yaml
input_boolean:
  local_control_enabled:
    name: "Local Control Enabled"
    icon: mdi:desktop-tower-monitor

# Optional: Add some triggers for testing
input_boolean:
  test_lock:
    name: "Test Lock"
    icon: mdi:lock
  test_volume:
    name: "Test Volume"
    icon: mdi:volume-high
  test_notification:
    name: "Test Notification"
    icon: mdi:bell
  test_shortcut:
    name: "Test Shortcut"
    icon: mdi:shortcut
```

## 2. Create Automations

### Lock System
```yaml
automation:
  - alias: "Lock System"
    trigger:
      - platform: state
        entity_id: input_boolean.test_lock
        to: "on"
    action:
      - event: local-control
        event_data:
          action: lock
          message: "System locked by automation"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.test_lock
```

### Volume Control
```yaml
automation:
  - alias: "Volume Up"
    trigger:
      - platform: state
        entity_id: input_boolean.test_volume
        to: "on"
    action:
      - event: local-control
        event_data:
          action: volumeup
          message: "Volume increased"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.test_volume
```

### Notifications
```yaml
automation:
  - alias: "Show Notification"
    trigger:
      - platform: state
        entity_id: input_boolean.test_notification
        to: "on"
    action:
      - event: local-control
        event_data:
          action: notification
          message: "Hello from Home Assistant!"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.test_notification
```

### Shortcuts
```yaml
automation:
  - alias: "Trigger Shortcut"
    trigger:
      - platform: state
        entity_id: input_boolean.test_shortcut
        to: "on"
    action:
      - event: local-control
        event_data:
          action: shortcut
          message: "FocusMode"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.test_shortcut
```

## 3. Test

1. Restart Home Assistant
2. Go to Developer Tools → States
3. Find your input_boolean entities
4. Toggle them to test the actions 