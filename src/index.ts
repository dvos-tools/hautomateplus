// Library entry point - exports only, no execution
export { HomeAssistantClient } from './client/HomeAssistantClient';
export { HomeAssistantWebSocket } from './client/HomeAssistantWebSocket';
export { SystemControlService } from './services/SystemControlService';
export { VolumeControl } from './utils/volumeControl';
export { LockService } from './services/LockService';
export { NotificationService } from './services/NotificationService';
export { MonitoringService } from './services/MonitoringService';

// Configuration exports
export { 
  getSystemControlConfig, 
  updateSystemControlConfig, 
  setEndpointEnabled, 
  isEndpointEnabled,
  type SystemControlConfig 
} from './config/systemControlConfig';

// Type exports
export * from './types/homeassistant';
export * from './types/monitoring';
