# HAutomatePlus

A TypeScript application that extends Home Assistant's automation capabilities by enabling local automation execution on macOS. This project serves as a bridge between Home Assistant events and local macOS automation capabilities.

## Features

- WebSocket connection to Home Assistant
- Authentication handling
- Event subscription and processing
- Local automation execution on macOS
- Automatic reconnection
- Clean shutdown handling
- TypeScript support
- Environment variable configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     - `HA_URL`: Your Home Assistant WebSocket URL (e.g., `ws://your-home-assistant-ip:8123/api/websocket`)
     - `HA_ACCESS_TOKEN`: Your long-lived access token from Home Assistant

   To get a long-lived access token:
   1. Log in to your Home Assistant instance
   2. Click on your profile name (bottom left)
   3. Scroll down to "Long-Lived Access Tokens"
   4. Create a new token

## Usage

1. Build the application:
```bash
npm run build
```

2. Start the application:
```bash
npm start
```

The application will:
- Connect to your Home Assistant instance
- Authenticate using your access token
- Subscribe to all events
- Process events and execute local automations as configured

To run in development mode with automatic recompilation:
```bash
npm run dev
```

## Local Automation

HAutomatePlus allows you to execute local automations on your macOS system in response to Home Assistant events. This provides capabilities that are not available through the standard Home Assistant companion app.

### Example Use Cases

- Execute local scripts in response to Home Assistant events
- Run macOS-specific automations
- Integrate with local system services
- Perform actions that require local system access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 