import { LocalControlEventData } from '../types/homeassistant';
import { VolumeService } from './volumeService';
import { ShortcutService } from './shortcutService';
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
        return VolumeService.increaseVolume();
        
      case 'volumedown':
        if (!isEndpointEnabled('volumeDown')) {
          console.warn('Volume down endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeService.decreaseVolume();
        
      case 'mute':
        if (!isEndpointEnabled('mute')) {
          console.warn('Mute endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeService.mute();
        
      case 'unmute':
        if (!isEndpointEnabled('unmute')) {
          console.warn('Unmute endpoint is disabled');
          return Promise.resolve();
        }
        return VolumeService.unmute();

      case 'notification':
        if (!isEndpointEnabled('notification')) {
          console.warn('Notification endpoint is disabled');
          return Promise.resolve();
        }
        return NotificationService.displayNotification(message);

      case 'shortcut':
        if (!isEndpointEnabled('shortcut')) {
          console.warn('Shortcut endpoint is disabled');
          return Promise.resolve();
        }
        // For shortcuts, the message should contain the shortcut name and optional parameter
        // Format: "ShortcutName" or "ShortcutName:Parameter"
        const shortcutParts = message.split(':');
        const shortcutName = shortcutParts[0].trim();
        const parameter = shortcutParts.length > 1 ? shortcutParts[1].trim() : undefined;
        
        if (!shortcutName) {
          console.warn('No shortcut name provided');
          return Promise.resolve();
        }
        
        return ShortcutService.trigger(shortcutName, parameter);
        
      default:
        console.warn(`Unknown action: ${action}`);
        return Promise.resolve();
    }
  }
} 