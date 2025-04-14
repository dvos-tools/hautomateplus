import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Service for controlling system lock functionality
 * 
 * Note: This service requires system permissions to control system settings.
 * When first used, macOS will prompt the user to grant permission for the application
 * to control system settings. The user must grant this permission for the lock
 * functionality to work properly.
 * 
 * To grant permissions:
 * 1. When prompted by macOS, click "Allow" to grant permission
 * 2. If permission was denied, go to System Preferences > Security & Privacy > Privacy > Accessibility
 * 3. Find your application in the list and check the box next to it
 * 4. You may need to restart the application after granting permissions
 */
export class LockService {
  /**
   * Lock the system (Command+Control+Q)
   * @param message Optional message to display in notification
   * @returns A promise that resolves when the system is locked
   */
  static async lockSystem(message: string = 'System is being locked'): Promise<void> {
    try {
      const appleScript = `
        tell application "System Events" to keystroke "q" using {command down, control down}
      `;
      await execAsync(`osascript -e '${appleScript}'`);
      console.log('System locked successfully');
    } catch (error) {
      console.error('Error locking system:', error);
      throw error;
    }
  }
} 