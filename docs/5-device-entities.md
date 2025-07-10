# Device Entities

## Available Entities

The service provides these entities to Home Assistant:

### System Control
- `binary_sensor.local_control_connected` - Connection status
- `sensor.local_control_latency` - Connection latency
- `sensor.local_control_uptime` - Service uptime

### Volume Control
- `sensor.local_control_volume` - Current volume level
- `binary_sensor.local_control_muted` - Mute status

## Usage

These entities are automatically created when the service connects to Home Assistant. You can use them in automations:

```yaml
automation:
  - alias: "Volume Too Loud"
    trigger:
      - platform: numeric_state
        entity_id: sensor.local_control_volume
        above: 80
    action:
      - event: local-control
        event_data:
          action: notification
          message: "Volume is too loud!"
``` 