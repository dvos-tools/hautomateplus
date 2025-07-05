import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Native Shortcut Control using Swift implementation
 * 
 * This provides a way to trigger macOS Shortcuts from TypeScript
 * 
 * Note: The Swift binary must be built before using this class.
 * Run: npm run build:native
 */
export class ShortcutService {
  private static binaryPath = join(__dirname, '../../native/shortcuts/shortcut_control');

  /**
   * Trigger a macOS Shortcut by name
   * @param shortcutName The name of the shortcut to trigger
   * @param parameter Optional parameter to pass to the shortcut
   * @returns A promise that resolves when the shortcut is triggered
   */
  static async trigger(shortcutName: string, parameter?: string): Promise<void> {
    try {
      if (parameter) {
        // Escape the parameter to handle special characters in shell
        const escapedParameter = parameter.replace(/'/g, "'\"'\"'");
        await execAsync(`${this.binaryPath} '${shortcutName}' '${escapedParameter}'`);
      } else {
        await execAsync(`${this.binaryPath} '${shortcutName}'`);
      }
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
   * Check if the native binary is available
   * @returns A promise that resolves to true if the binary exists and is executable
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync(`test -x "${this.binaryPath}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the path to the native binary
   * @returns The absolute path to the shortcut control binary
   */
  static getBinaryPath(): string {
    return this.binaryPath;
  }
} 