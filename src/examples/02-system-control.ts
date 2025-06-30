import dotenv from 'dotenv';
import { HomeAssistantClient, SystemControlService } from '../index';

// Load environment variables
dotenv.config();

const HA_URL = process.env.HA_URL;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

if (!HA_URL || !HA_ACCESS_TOKEN) {
  throw new Error('Home Assistant URL and access token must be configured in .env file');
}

console.log('Starting system control listener...');

// Create and start the client
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for local control events and execute commands
client.on('local_control_event', async (event) => {
  console.log('Executing command:', event.data.action);
  
  try {
    await SystemControlService.executeCommand(event.data);
    console.log('Command executed successfully');
  } catch (error) {
    console.error('Failed to execute command:', error);
  }
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.close();
  process.exit(0);
});

console.log('Ready to execute system control commands');
console.log('Supported actions: lock, volumeup, volumedown, mute, unmute, notification');
console.log('Press Ctrl+C to stop'); 