import dotenv from 'dotenv';
import { 
  HomeAssistantClient, 
  SystemControlService, 
  getSystemControlConfig
} from '../index';

// Load environment variables
dotenv.config();

const HA_URL = process.env.HA_URL;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

if (!HA_URL || !HA_ACCESS_TOKEN) {
  throw new Error('Home Assistant URL and access token must be configured in .env file');
}

console.log('Home Assistant Local Control App');
console.log('================================');

// Show current configuration
const config = getSystemControlConfig();
console.log('Enabled endpoints:', Object.entries(config)
  .filter(([_, enabled]) => enabled)
  .map(([endpoint, _]) => endpoint)
  .join(', ')
);

// Create and start the client
const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);

// Listen for local control events
client.on('local_control_event', async (event) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] Received event:`, {
    action: event.data.action,
    message: event.data.message,
  });

  try {
    await SystemControlService.executeCommand(event.data);
    console.log('✅ Command executed successfully');
  } catch (error) {
    console.error('❌ Failed to execute command:', error);
  }
});

// Handle connection errors
client.on('error', (error) => {
  console.error('Connection error:', error);
});

// Health check every 30 seconds
setInterval(() => {
  const health = client.getConnectionHealth();
  const stats = client.getConnectionStats();
  
  console.log(`\n[${new Date().toLocaleTimeString()}] 🔍 Health Check:`);
  console.log(`   Status: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
  console.log(`   Quality: ${health.connectionQuality.toUpperCase()}`);
  console.log(`   Latency: ${health.latency ? `${health.latency}ms` : 'N/A'}`);
  console.log(`   Last Heartbeat: ${health.lastHeartbeat ? health.lastHeartbeat.toLocaleTimeString() : 'Never'}`);
  console.log(`   Missed Heartbeats: ${health.missedHeartbeats}`);
  console.log(`   Total Connections: ${stats.totalConnections}`);
  console.log(`   Successful: ${stats.successfulConnections}`);
  console.log(`   Failed: ${stats.failedConnections}`);
  console.log(`   Reconnects: ${stats.totalReconnects}`);
  console.log(`   Uptime: ${Math.round(stats.connectionUptime / 1000)}s`);
  
  // Show warning if unhealthy
  if (!health.isHealthy) {
    console.log(`   ⚠️  WARNING: Connection appears unhealthy!`);
  }
}, 30000);

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  client.close();
  
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Goodbye!');
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

console.log('✅ Connected to Home Assistant');
console.log('📡 Listening for local-control events...');
console.log('💡 Supported actions: lock, volumeup, volumedown, mute, unmute, notification');
console.log('🛑 Press Ctrl+C to stop'); 