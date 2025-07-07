// Library entry point - exports only, no execution
export { HomeAssistantClient } from './client/HomeAssistantClient';
export { HomeAssistantWebSocket } from './client/HomeAssistantWebSocket';
export { VolumeService } from './services/volumeService';
export { ShortcutService } from './services/shortcutService';
export { SystemControlService } from './services/systemControlService';
export { LockService } from './services/lockService';
export { NotificationService } from './services/notificationService';
export { MonitoringService } from './services/monitoringService';
export { DeviceInfoService } from './services/deviceInfoService';
export { DeviceEntityService } from './services/deviceEntityService';

export { SystemControlApi } from './api/systemControlApi';

// Configuration exports
export { 
  getSystemControlConfig, 
  updateSystemControlConfig, 
  setEndpointEnabled, 
  isEndpointEnabled,
  type SystemControlConfig 
} from './config/systemControlConfig';

// Type exports
export type { 
  HAEvent, 
  LocalControlEventData,
  CustomEntity,
  CustomEntityConfig,
  CustomEntityState
} from './types/homeassistant';
export * from './types/monitoring';
