import dotenv from 'dotenv';
import { HomeAssistantClient } from '..';
import { SystemControlService } from '../services/SystemControlService';

// Load environment variables
dotenv.config();

const HA_URL = process.env.HA_URL;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

if (!HA_URL || !HA_ACCESS_TOKEN) {
  throw new Error('Home Assistant URL and access token must be configured in .env file');
}

// Create and start the client
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Example event listener for local-control events
client.on('local_control_event', async (event) => {
  console.log('Local control event:', {
    data: event.data,
    time: event.time_fired,
  });

  try {
    // Execute the appropriate system control command based on the action
    await SystemControlService.executeCommand(event.data);
  } catch (error) {
    console.error('Failed to execute system control command:', error);
  }
});

// Handle process termination and PM2 signals
const shutdown = async () => {
  console.log('Shutting down...');
  client.close();
  // Give PM2 time to process the shutdown
  await new Promise(resolve => setTimeout(resolve, 1000));
  process.exit(0);
};

// Handle various termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGQUIT', shutdown);

// Handle PM2 specific signals
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    shutdown();
  }
});

// Notify PM2 that the application is ready
if (process.send) {
  process.send('ready');
}

// Log startup
console.log('Home Assistant Local Control Example Started'); 