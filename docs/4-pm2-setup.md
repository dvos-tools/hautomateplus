# 4. PM2 Setup

Want to run this as a standalone service? Here's how to use PM2.

PM2 is a process manager for Node.js applications that helps keep your application running, restarting it if it crashes, and providing monitoring capabilities.

## Installation

```bash
npm install -g pm2
```

## Quick Start

```bash
# Install PM2
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## PM2 Commands

### Basic Commands
```bash
# Start the service
pm2 start ecosystem.config.js

# Stop the service
pm2 stop home-assistant-local-control

# Restart the service
pm2 restart home-assistant-local-control

# View logs
pm2 logs home-assistant-local-control

# Monitor in real-time
pm2 monit

# List all services
pm2 list
```

### Monitoring Commands
```bash
# Monitor applications in real-time
pm2 monit

# View logs
pm2 logs home-assistant-local-control

# View logs with timestamps
pm2 logs home-assistant-local-control --timestamp

# Follow logs (like tail -f)
pm2 logs home-assistant-local-control --follow

# Clear logs
pm2 flush
```

### System Integration
```bash
# Save current PM2 config
pm2 save

# Setup auto-start
pm2 startup

# Follow the instructions it gives you
```

## Configuration

The `ecosystem.config.js` file controls:
- **Auto-restart**: Restarts if it crashes
- **Memory limit**: Restarts if memory > 1GB
- **Logs**: Timestamps and rotation
- **Graceful shutdown**: Waits 3 seconds to close

## Environment Variables

Create a `.env` file in your project root:

```env
HA_URL=ws://your-home-assistant-instance:8123/api/websocket
HA_ACCESS_TOKEN=your_long_lived_access_token
```

## Health Monitoring

The application includes built-in health monitoring that logs every 30 seconds:

```
[12:00:00] 🔍 Health Check:
   Status: ✅ Healthy
   Quality: EXCELLENT
   Latency: 45ms
   Last Heartbeat: 12:00:00
   Missed Heartbeats: 0
   Total Connections: 5
   Successful: 5
   Failed: 0
   Reconnects: 0
   Uptime: 3600s
```

## Troubleshooting

```bash
# Check if it's running
pm2 list

# View recent logs
pm2 logs home-assistant-local-control --lines 50

# Restart if stuck
pm2 restart home-assistant-local-control

# Delete and recreate
pm2 delete home-assistant-local-control
pm2 start ecosystem.config.js
```

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Save PM2 configuration:**
   ```bash
   pm2 save
   ```

4. **Setup auto-start on boot:**
   ```bash
   pm2 startup
   # Follow the instructions provided
   ```

5. **Monitor the application:**
   ```bash
   pm2 monit
   ```

## Useful PM2 Features

- **Auto-restart**: Application restarts automatically if it crashes
- **Memory monitoring**: Restarts if memory usage exceeds limits
- **Log management**: Automatic log rotation and management
- **Process monitoring**: Real-time monitoring with `pm2 monit`
- **System integration**: Auto-start on system boot
- **Multiple environments**: Support for different environment configurations

## Alternative: No PM2

If you don't want PM2, just run:

```bash
npm run build
npm start
```

But PM2 is recommended for production use.

That's it! Your service will keep running and restart automatically. 