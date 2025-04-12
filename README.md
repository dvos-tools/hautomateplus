# Home Assistant Event Listener

A TypeScript application that connects to Home Assistant's WebSocket API and listens for all events.

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
- Log all received events to the console

To run in development mode with automatic recompilation:
```bash
npm run dev
```

## Features

- WebSocket connection to Home Assistant
- Authentication handling
- Event subscription
- Automatic reconnection
- Clean shutdown handling
- TypeScript support
- Environment variable configuration 