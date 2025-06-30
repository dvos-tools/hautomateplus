import dotenv from 'dotenv';
import { HomeAssistantClient } from '../index';

// Load environment variables
dotenv.config();

const HA_URL = process.env.HA_URL;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

if (!HA_URL || !HA_ACCESS_TOKEN) {
  throw new Error('Home Assistant URL and access token must be configured in .env file');
}

console.log('Connecting to Home Assistant...');

// Create and start the client
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for local control events
client.on('local_control_event', async (event) => {
  console.log('Received event:', {
    action: event.data.action,
    message: event.data.message,
    time: event.time_fired,
  });
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.close();
  process.exit(0);
});

console.log('Listening for local-control events...');
console.log('Press Ctrl+C to stop'); 