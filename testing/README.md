# Testing Tools

This directory contains testing and monitoring tools for the Home Assistant Local Control app.

## Files

### `test-connection.js`
A standalone test script to verify the Home Assistant connection and functionality.

**Usage:**
```bash
npm run test:connection
```

This script will:
- Load environment variables from `.env`
- Connect to Home Assistant
- Monitor connection health for 30 seconds
- Display detailed connection statistics
- Exit automatically if connection is stable

### `pm2-monitor.js`
A monitoring script to diagnose issues with the PM2-managed background process.

**Usage:**
```bash
# Basic monitoring
npm run pm2:monitor

# Monitor and restart if needed
npm run pm2:monitor -- --restart
```

This script will:
- Check PM2 status and app health
- Display system resources
- Verify environment configuration
- Show recent logs
- Provide troubleshooting tips

## Troubleshooting

### Common Issues

1. **App stops responding but PM2 shows it as healthy**
   - Run `npm run pm2:monitor` to check detailed status
   - Check logs with `npm run pm2:logs`
   - Restart the app with `npm run pm2:restart`

2. **Connection issues**
   - Run `npm run test:connection` to verify connectivity
   - Check your `.env` file configuration
   - Verify Home Assistant is accessible from your machine

3. **Authentication errors**
   - Regenerate your long-lived access token in Home Assistant
   - Update the `HA_ACCESS_TOKEN` in your `.env` file

### PM2 Commands

```bash
# Start the app
npm run pm2:start

# Stop the app
npm run pm2:stop

# Restart the app
npm run pm2:restart

# View logs
npm run pm2:logs

# Delete the app from PM2
npm run pm2:delete

# Monitor app status
npm run pm2:monitor
```

### Environment Variables

Make sure your `.env` file contains:
- `HA_URL`: Your Home Assistant URL
- `HA_ACCESS_TOKEN`: Your long-lived access token
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

See `.env.example` for all available options. 