# 1. Home Assistant Setup

Quick guide to set up Home Assistant to work with this library.

## Create Access Token

1. Go to your Home Assistant instance
2. Click your username in the sidebar
3. Scroll down to **Long-Lived Access Tokens**
4. Click **Create Token**
5. Name it "Local Control" and copy the token

## Get Your URL

- **Local**: `ws://192.168.1.100:8123/api/websocket`
- **Cloud**: `wss://home.yourdomain.app/api/websocket`
- **Local with SSL**: `wss://192.168.1.100:8123/api/websocket`

## Create Test Automation

Add this to your `configuration.yaml`:

```yaml
automation:
  - alias: "Test Lock Computer"
    trigger:
      - platform: event
        event_type: test_lock
    action:
      - service: event.fire
        data:
          event_type: local-control
          event_data:
            action: lock
            message: "Locking computer"
```

## Test It

1. Go to **Developer Tools** → **Events**
2. Event type: `test_lock`
3. Click **Fire Event**
4. Your Mac should lock!

## More Examples

```yaml
# Volume up
automation:
  - alias: "Volume Up"
    trigger:
      - platform: event
        event_type: volume_up
    action:
      - service: event.fire
        data:
          event_type: local-control
          event_data:
            action: volumeup

# Show notification
  - alias: "Show Notification"
    trigger:
      - platform: event
        event_type: show_notification
    action:
      - service: event.fire
        data:
          event_type: local-control
          event_data:
            action: notification
            message: "Hello from Home Assistant!"
```

## Trigger from Other Automations

```yaml
# Lock when leaving home
automation:
  - alias: "Lock Computer When Leaving"
    trigger:
      - platform: state
        entity_id: person.your_name
        to: "not_home"
    action:
      - event: test_lock
```

That's it! Your Home Assistant can now control your Mac. 