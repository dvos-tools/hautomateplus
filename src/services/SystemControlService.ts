import { LocalControlEventData } from '../types/homeassistant';
import { VolumeControl } from '../utils/volumeControl';
import { LockService } from './LockService';
import { NotificationService } from './NotificationService';
import { isEndpointEnabled } from '../config/systemControlConfig';

/**
 * Service for executing system control commands
 */
export class SystemControlService {
  /**
   * Execute a system control command based on the action specified in the event data
   * @param eventData The event data containing the action and message
   * @returns A promise that resolves when the command is executed
   */
  static async executeCommand(eventData: LocalControlEventData): Promise<void> {
    const { action = 'unknown', message = 'No message' } = eventData;
    
    // Check if the endpoint is enabled before executing the command
    switch (action.toLowerCase()) {
      case 'lock':
        if (!isEndpointEnabled('lock')) {
          console.warn('Lock endpoint is disabled');
          return Promise.resolve();
        }
        return LockService.lockSystem(message);
        
      case 'volumeup':
        if (!isEndpointEnabled('volumeUp')) {
          console.warn('Volume up endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeControl.increaseVolume();
        
      case 'volumedown':
        if (!isEndpointEnabled('volumeDown')) {
          console.warn('Volume down endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeControl.decreaseVolume();
        
      case 'mute':
        if (!isEndpointEnabled('mute')) {
          console.warn('Mute endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeControl.setMute(true);
        
      case 'unmute':
        if (!isEndpointEnabled('unmute')) {
          console.warn('Unmute endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeControl.setMute(false);
        
      case 'notification':
        if (!isEndpointEnabled('notification')) {
          console.warn('Notification endpoint is disabled');
          return Promise.resolve();
        }
        return NotificationService.displayNotification(message);
        
      default:
        console.warn(`Unknown action: ${action}`);
        return Promise.resolve();
    }
  }
} 