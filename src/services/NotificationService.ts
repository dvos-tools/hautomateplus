import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Service for displaying system notifications
 * 
 * Note: This service requires system permissions to display notifications.
 * When first used, macOS will prompt the user to grant permission for the application
 * to control system settings. The user must grant this permission for notifications
 * to work properly.
 * 
 * To grant permissions:
 * 1. When prompted by macOS, click "Allow" to grant permission
 * 2. If permission was denied, go to System Preferences > Security & Privacy > Privacy > Accessibility
 * 3. Find your application in the list and check the box next to it
 * 4. You may need to restart the application after granting permissions
 */
export class NotificationService {
  /**
   * Display a system notification
   * @param message The message to display
   * @param title Optional title for the notification
   * @param subtitle Optional subtitle for the notification
   * @returns A promise that resolves when the notification is displayed
   */
  static async displayNotification(
    message: string, 
    title: string = 'System Control',
    subtitle?: string
  ): Promise<void> {
    try {
      let appleScript = `
        tell application "System Events"
          display notification "${message}" with title "${title}"
      `;
      
      // Add subtitle if provided
      if (subtitle) {
        appleScript += ` subtitle "${subtitle}"`;
      }
      
      appleScript += `
        end tell
      `;
      
      await execAsync(`osascript -e '${appleScript}'`);
      console.log('Notification displayed successfully');
    } catch (error) {
      console.error('Error displaying notification:', error);
      throw error;
    }
  }
} 