import dotenv from 'dotenv';
import { 
  HomeAssistantClient, 
  SystemControlService, 
  getSystemControlConfig,
  DeviceEntityService,
  DeviceInfoService
} from '../index';

// Load environment variables
dotenv.config();

const HA_URL = process.env.HA_URL!;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN!;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (!HA_URL || !HA_ACCESS_TOKEN) {
  throw new Error('Home Assistant URL and access token must be configured in .env file');
}

// Enhanced logging function
function log(level: string, message: string, ...args: any[]) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  const currentLevel = levels[LOG_LEVEL as keyof typeof levels] || 1;
  const messageLevel = levels[level as keyof typeof levels] || 1;
  
  if (messageLevel >= currentLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  }
}

log('info', 'Home Assistant Local Control App Starting');
log('info', '==========================================');

// Test and show device information
async function showDeviceInfo() {
  try {
    const deviceInfo = await DeviceInfoService.getDeviceInfo();
    const hasBattery = await DeviceInfoService.hasBattery();
    
    log('info', 'Device Information:');
    log('info', `  Device Name: ${deviceInfo.deviceName}`);
    log('info', `  Has Battery: ${hasBattery}`);
    if (hasBattery) {
      log('info', `  Battery Level: ${deviceInfo.batteryLevel}%`);
      log('info', `  Battery Charging: ${deviceInfo.isCharging}`);
    }
    log('info', '');
  } catch (error) {
    log('error', 'Failed to get device information:', error);
  }
}

// Show current configuration
const config = getSystemControlConfig();
log('info', 'Enabled endpoints:', Object.entries(config)
  .filter(([_, enabled]) => enabled)
  .map(([endpoint, _]) => endpoint)
  .join(', ')
);

// Create and start the client
let client: HomeAssistantClient;
let deviceEntityService: DeviceEntityService;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '10');

async function createClient() {
  try {
    client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);
    
    // Initialize device entity service
    deviceEntityService = new DeviceEntityService();
    await deviceEntityService.initialize();
    
    setupClientEventListeners();
    return client;
  } catch (error) {
    log('error', 'Failed to create client:', error);
    throw error;
  }
}

function setupClientEventListeners() {
  if (!client) return;

  // Listen for local control events
  client.on('local_control_event', async (event) => {
    log('info', 'Received event:', {
      action: event.data.action,
      message: event.data.message,
    });

    try {
      await SystemControlService.executeCommand(event.data);
      log('info', 'Command executed successfully');
    } catch (error) {
      log('error', 'Failed to execute command:', error);
    }
  });

  // Handle connection errors
  client.on('error', (error) => {
    log('error', 'Connection error:', error);
    handleConnectionError();
  });

  // Set up device entity service
  const setupDeviceEntities = async () => {
    log('info', 'Setting up device entities...');
    try {
      await deviceEntityService.updateConnectionStatus(true);
      deviceEntityService.startPeriodicUpdates(); // Update every 30 seconds (default)
      log('info', 'Device entities service started with periodic updates');
    } catch (error) {
      log('error', 'Failed to setup device entities:', error);
      // Stop periodic updates if initial setup fails
      deviceEntityService.stopPeriodicUpdates();
      throw error;
    }
  };
  
  // Set up device entities after a short delay to ensure connection is stable
  setTimeout(async () => {
    try {
      await setupDeviceEntities();
    } catch (error) {
      log('error', 'Failed to setup device entities, will retry later:', error);
      // Retry after 30 seconds
      setTimeout(async () => {
        try {
          await setupDeviceEntities();
        } catch (retryError) {
          log('error', 'Device entities setup failed on retry:', retryError);
        }
      }, 30000);
    }
  }, 2000);
}

function handleConnectionError() {
  reconnectAttempts++;
  log('warn', `Connection error occurred (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    log('error', 'Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }
  
  // Wait before attempting to recreate client
  setTimeout(async () => {
    log('info', 'Attempting to recreate client...');
    try {
      if (client) {
        client.close();
      }
      await createClient();
      reconnectAttempts = 0; // Reset on successful creation
    } catch (error) {
      log('error', 'Failed to recreate client:', error);
      handleConnectionError();
    }
  }, 5000);
}

// Health check every 30 seconds
let healthCheckInterval: NodeJS.Timeout;

function startHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(() => {
    if (!client) {
      log('warn', 'Client not available for health check');
      return;
    }
    
    const health = client.getConnectionHealth();
    const stats = client.getConnectionStats();
    
    log('debug', 'Health Check:', {
      status: health.isHealthy ? 'Healthy' : 'Unhealthy',
      quality: health.connectionQuality.toUpperCase(),
      latency: health.latency ? `${health.latency}ms` : 'N/A',
      lastHeartbeat: health.lastHeartbeat ? health.lastHeartbeat.toLocaleTimeString() : 'Never',
      missedHeartbeats: health.missedHeartbeats,
      totalConnections: stats.totalConnections,
      successfulConnections: stats.successfulConnections,
      failedConnections: stats.failedConnections,
      totalReconnects: stats.totalReconnects,
      uptime: `${Math.round(stats.connectionUptime / 1000)}s`
    });
    
    // Show warning if unhealthy
    if (!health.isHealthy) {
      log('warn', 'Connection appears unhealthy!');
    }
  }, 30000);
}

// Graceful shutdown
const shutdown = async () => {
  log('info', 'Shutting down gracefully...');
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  // Stop device entity updates and update connection status
  if (deviceEntityService) {
    try {
      deviceEntityService.stopPeriodicUpdates();
      await deviceEntityService.updateConnectionStatus(false);
      log('info', 'Device entity service stopped');
    } catch (error) {
      log('error', 'Error stopping device entity service:', error);
    }
  }
  
  if (client) {
    client.close();
  }
  
  // Give time for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('info', 'Goodbye!');
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

// Initialize the application
async function initializeApp() {
  try {
    // Show device information first
    await showDeviceInfo();
    
    await createClient();
    startHealthCheck();
    
    // Notify PM2 that the application is ready
    if (process.send) {
      process.send('ready');
    }
    
    log('info', 'Connected to Home Assistant');
    log('info', 'Listening for local-control events...');
    log('info', 'Supported actions: lock, volumeup, volumedown, mute, unmute, notification');
    log('info', 'Device entities will be created when connection is established');
    log('info', 'Press Ctrl+C to stop');
    
  } catch (error) {
    log('error', 'Failed to initialize app:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp().catch((error) => {
  log('error', 'Application failed to start:', error);
  process.exit(1);
}); 