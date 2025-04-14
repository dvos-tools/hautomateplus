import { SystemControlApi } from '../api/systemControlApi';
import { SystemControlService } from '../services/SystemControlService';
import { LocalControlEventData } from '../types/homeassistant';

/**
 * Example of how to use the system control API to enable/disable endpoints
 */
export function systemControlExample() {
  // Get the current configuration
  console.log('Current configuration:', SystemControlApi.getConfig());
  
  // Disable specific endpoints
  SystemControlApi.setEndpointEnabled('lock', false);
  SystemControlApi.setEndpointEnabled('notification', false);
  
  console.log('Updated configuration:', SystemControlApi.getConfig());
  
  // Try to execute commands
  const lockEvent: LocalControlEventData = {
    action: 'lock',
    message: 'Locking system'
  };
  
  const notificationEvent: LocalControlEventData = {
    action: 'notification',
    message: 'This is a test notification'
  };
  
  // This will be skipped because the lock endpoint is disabled
  SystemControlService.executeCommand(lockEvent);
  
  // This will be skipped because the notification endpoint is disabled
  SystemControlService.executeCommand(notificationEvent);
  
  // Enable all endpoints
  SystemControlApi.enableAllEndpoints();
  console.log('All endpoints enabled:', SystemControlApi.getConfig());
  
  // Now the commands will execute
  SystemControlService.executeCommand(lockEvent);
  SystemControlService.executeCommand(notificationEvent);
  
  // Disable all endpoints
  SystemControlApi.disableAllEndpoints();
  console.log('All endpoints disabled:', SystemControlApi.getConfig());
  
  // Update multiple endpoints at once
  SystemControlApi.updateConfig({
    volumeUp: true,
    volumeDown: true,
    mute: false,
    unmute: false,
    lock: true,
    notification: false
  });
  
  console.log('Custom configuration:', SystemControlApi.getConfig());
} 