import dotenv from 'dotenv';
import { 
  HomeAssistantClient, 
  DeviceEntityService,
  setEndpointEnabled
} from '../index';
import * as os from 'os';
import * as path from 'path';

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

async function customEntitiesDemo() {
  log('info', 'Starting Custom Entities Demo');
  log('info', '============================');

  // Enable custom entities feature
  setEndpointEnabled('customEntities', true);
  log('info', 'Custom entities feature enabled');

  // Create Home Assistant client
  const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);
  
  // Get user's home directory
  const homeDir = os.homedir();
  const outputFile = path.join(homeDir, 'hautomateplus', 'my_shortcut_output.txt');
  
  // Example configuration - single entity
  const customEntityConfig = {
    enabled: true,
    entities: [
      {
        name: 'MySensor',
        shortcutName: 'MyShortcut',
        filePath: outputFile,
        entityType: 'sensor',
        unitOfMeasurement: 'units',
        deviceClass: 'generic'
      }
    ]
  };

  log('info', 'Configuration loaded successfully');
  log('info', `Found ${customEntityConfig.entities.length} custom entity`);
  log('info', `Output file will be: ${outputFile}`);

  // Create device entity service (handles both device status and custom entities)
  const deviceEntityService = new DeviceEntityService();

  // Connect to Home Assistant
  client.on('auth_ok', async () => {
    log('info', 'Connected to Home Assistant, initializing device entities...');
    
    try {
      // Initialize the device entity service with custom entities
      await deviceEntityService.initialize(customEntityConfig);
      
      log('info', 'Device entities initialized successfully');
      
      // Show sample configuration
      log('info', 'Sample configuration:');
      console.log(JSON.stringify({
        enabled: true,
        entities: [
          {
            name: 'MySensor',
            shortcutName: 'MyShortcut',
            filePath: '~/hautomateplus/my_shortcut_output.txt',
            entityType: 'sensor',
            unitOfMeasurement: 'units',
            deviceClass: 'generic'
          }
        ]
      }, null, 2));
      
      // Start periodic updates (includes custom entities)
      deviceEntityService.startPeriodicUpdates(30000); // 30 seconds
      
      // Show current custom entities
      const customEntities = deviceEntityService.getCustomEntities();
      log('info', `Custom entities configured: ${customEntities.length} entity`);
      customEntities.forEach(entity => {
        log('info', `  ${entity.name}: ${entity.entityId}`);
      });
      
    } catch (error) {
      log('error', 'Failed to initialize device entities:', error);
    }
  });

  client.on('local_control_event', async (event) => {
    log('info', 'Local control event received:', event.data);
  });

  client.on('error', (error) => {
    log('error', 'Home Assistant client error:', error);
  });

  // The WebSocket connects automatically when the client is created
  log('info', 'Home Assistant client created, waiting for connection...');

  // Keep the process running
  process.on('SIGINT', async () => {
    log('info', 'Shutting down...');
    deviceEntityService.stopPeriodicUpdates();
    client.close();
    process.exit(0);
  });

  log('info', 'Custom entities demo is running...');
  log('info', 'The app will run the shortcut every 30 seconds and sync its output to Home Assistant');
  log('info', 'Make sure you have created the corresponding shortcut in the macOS Shortcuts app:');
  log('info', '  - MyShortcut');
  log('info', `  - The shortcut should write to: ${outputFile}`);
  log('info', 'Check your Home Assistant instance for the new entity');
  log('info', 'Press Ctrl+C to stop');
}

// Run the demo
customEntitiesDemo().catch((error) => {
  log('error', 'Demo failed:', error);
  process.exit(1);
}); 