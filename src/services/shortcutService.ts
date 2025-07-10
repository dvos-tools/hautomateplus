import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Shortcut Control using AppleScript with Shortcuts Events
 * 
 * This provides a way to trigger macOS Shortcuts from TypeScript
 * using direct AppleScript calls to the Shortcuts Events application
 */
export class ShortcutService {
  /**
   * Trigger a macOS Shortcut by name using AppleScript
   * @param shortcutName The name of the shortcut to trigger
   * @param parameter Optional parameter to pass to the shortcut
   * @returns A promise that resolves when the shortcut is triggered
   */
  static async trigger(shortcutName: string, parameter?: string): Promise<void> {
    try {
      // Escape the shortcut name and parameter for AppleScript
      const escapedShortcutName = shortcutName.replace(/"/g, '\\"');

      let appleScript: string;
      if (parameter) {
        const escapedParameter = parameter.replace(/"/g, '\\"');
        appleScript = `
          tell application "Shortcuts Events"
            run the shortcut named "${escapedShortcutName}" with input "${escapedParameter}"
          end tell
        `;
      } else {
        appleScript = `
          tell application "Shortcuts Events"
            run the shortcut named "${escapedShortcutName}"
          end tell
        `;
      }

      // Execute the AppleScript
      await execAsync(`osascript -e '${appleScript}'`);

      console.log(`Shortcut '${shortcutName}' triggered successfully`);
    } catch (error) {
      console.error('Error triggering shortcut:', error);
      throw new Error(`Failed to trigger shortcut '${shortcutName}': ${error}`);
    }
  }

  /**
   * Trigger a macOS Shortcut without parameters
   * @param shortcutName The name of the shortcut to trigger
   * @returns A promise that resolves when the shortcut is triggered
   */
  static async triggerShortcut(shortcutName: string): Promise<void> {
    return this.trigger(shortcutName);
  }

  /**
   * Trigger a macOS Shortcut with a parameter
   * @param shortcutName The name of the shortcut to trigger
   * @param parameter The parameter to pass to the shortcut
   * @returns A promise that resolves when the shortcut is triggered
   */
  static async triggerShortcutWithParameter(shortcutName: string, parameter: string): Promise<void> {
    return this.trigger(shortcutName, parameter);
  }

  /**
   * Check if osascript is available (should always be true on macOS)
   * @returns A promise that resolves to true if osascript is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync('which osascript');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get information about the shortcut service
   * @returns A string describing the shortcut service implementation
   */
  static getServiceInfo(): string {
    return 'ShortcutService using AppleScript with Shortcuts Events application';
  }
} 
