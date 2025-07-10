import { HomeAssistantClient } from '../client/HomeAssistantClient';
import { DeviceEntityService } from '../services/deviceEntityService';
import { DeviceInfoService } from '../services/deviceInfoService';
import { SystemControlService } from '../services/systemControlService';

// Configuration
const HA_URL = process.env.HA_URL || 'ws://localhost:8123/api/websocket';
const HA_TOKEN = process.env.HA_TOKEN || '';

if (!HA_TOKEN) {
  console.error('HA_TOKEN environment variable is required');
  process.exit(1);
}

let client: HomeAssistantClient;
let deviceEntityService: DeviceEntityService;

// Logging function
function log(level: string, message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
}

// Initialize the application
async function initializeApp() {
  try {
    log('info', 'Initializing device entity service...');
    
    // Create Home Assistant client
    client = new HomeAssistantClient(HA_URL, HA_TOKEN);
    
    // Create device entity service
    deviceEntityService = new DeviceEntityService();
    
    // Initialize device entities
    await deviceEntityService.initialize();
    
    // Start periodic updates
    deviceEntityService.startPeriodicUpdates(); // Update every 30 seconds (default)
    
    // Set up event listeners
    setupEventListeners();
    
    log('info', 'Device entity service initialized successfully');
    log('info', 'Device information will be updated every 30 seconds');
    
  } catch (error) {
    log('error', 'Failed to initialize device entity service:', error);
    process.exit(1);
  }
}

// Set up event listeners
function setupEventListeners() {
  // Handle local control events
  client.on('local_control_event', async (event) => {
    log('info', 'Received local control event:', event.data);
    
    try {
      await SystemControlService.executeCommand(event.data);
      log('info', 'Command executed successfully');
    } catch (error) {
      log('error', 'Error executing command:', error);
    }
  });

  // Handle connection status changes
  client.on('error', async (error) => {
    log('error', 'Home Assistant connection error:', error);
    await deviceEntityService.updateConnectionStatus(false);
  });

  // Update connection status when reconnected
  const ws = client.getWebSocket();
  
  // Listen for connection events
  ws.on('open', async () => {
    log('info', 'Connected to Home Assistant');
    await deviceEntityService.updateConnectionStatus(true);
  });
  
  ws.on('close', async () => {
    log('info', 'Disconnected from Home Assistant');
    await deviceEntityService.updateConnectionStatus(false);
  });
}

// Graceful shutdown
function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    log('info', `Received ${signal}, shutting down gracefully...`);
    
    try {
      // Stop periodic updates
      deviceEntityService?.stopPeriodicUpdates();
      
      // Update connection status to disconnected
      await deviceEntityService?.updateConnectionStatus(false);
      
      // Close client
      client?.close();
      
      log('info', 'Shutdown complete');
      process.exit(0);
    } catch (error) {
      log('error', 'Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Test device information
async function testDeviceInfo() {
  try {
    log('info', 'Testing device information...');
    
    const deviceInfo = await DeviceInfoService.getDeviceInfo();
    log('info', 'Device information:', deviceInfo);
    
    const hasBattery = await DeviceInfoService.hasBattery();
    log('info', 'Device has battery:', hasBattery);
    
    const deviceName = await DeviceInfoService.getDeviceName();
    log('info', 'Device name:', deviceName);
    
  } catch (error) {
    log('error', 'Error testing device info:', error);
  }
}

// Main function
async function main() {
  log('info', 'Device Entity Service Starting');
  log('info', '================================');
  
  // Test device information first
  await testDeviceInfo();
  
  // Set up graceful shutdown
  setupGracefulShutdown();
  
  // Initialize the application
  await initializeApp();
  
  log('info', 'Device entity service is running');
  log('info', 'Press Ctrl+C to stop');
}

// Start the application
main().catch((error) => {
  log('error', 'Application failed to start:', error);
  process.exit(1);
}); 
