import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Utility for controlling system volume using AppleScript
 * 
 * Note: This utility requires system permissions to control volume settings.
 * When first used, macOS will prompt the user to grant permission for the application
 * to control system settings. The user must grant this permission for the volume
 * control functions to work properly.
 * 
 * To grant permissions:
 * 1. When prompted by macOS, click "Allow" to grant permission
 * 2. If permission was denied, go to System Preferences > Security & Privacy > Privacy > Accessibility
 * 3. Find your application in the list and check the box next to it
 * 4. You may need to restart the application after granting permissions
 */
export class VolumeControl {
  /**
   * Get the current system volume level (0-100)
   * @returns A promise that resolves with the current volume level
   */
  static async getVolume(): Promise<number> {
    try {
      // Use osascript to get the current volume
      const { stdout } = await execAsync('osascript -e "output volume of (get volume settings)"');
      return parseInt(stdout.trim(), 10);
    } catch (error) {
      console.error('Error getting volume:', error);
      return 0;
    }
  }

  /**
   * Set the system volume level (0-100)
   * @param level The volume level to set (0-100)
   * @returns A promise that resolves when the volume is set
   */
  static async setVolume(level: number): Promise<void> {
    // Ensure level is between 0 and 100
    const safeLevel = Math.max(0, Math.min(100, level));
    
    try {
      // Use osascript to set the volume
      await execAsync(`osascript -e "set volume output volume ${safeLevel}"`);
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  }

  /**
   * Increase the system volume by a specified amount
   * @param amount The amount to increase the volume by (default: 10)
   * @returns A promise that resolves when the volume is increased
   */
  static async increaseVolume(amount: number = 10): Promise<void> {
    try {
      const currentVolume = await this.getVolume();
      const newVolume = Math.min(100, currentVolume + amount);
      await this.setVolume(newVolume);
    } catch (error) {
      console.error('Error increasing volume:', error);
      throw error;
    }
  }

  /**
   * Decrease the system volume by a specified amount
   * @param amount The amount to decrease the volume by (default: 10)
   * @returns A promise that resolves when the volume is decreased
   */
  static async decreaseVolume(amount: number = 10): Promise<void> {
    try {
      const currentVolume = await this.getVolume();
      const newVolume = Math.max(0, currentVolume - amount);
      await this.setVolume(newVolume);
    } catch (error) {
      console.error('Error decreasing volume:', error);
      throw error;
    }
  }

  /**
   * Mute or unmute the system audio
   * @param mute Whether to mute (true) or unmute (false) the audio
   * @returns A promise that resolves when the mute state is set
   */
  static async setMute(mute: boolean): Promise<void> {
    try {
      // Use osascript to set the mute state
      await execAsync(`osascript -e "set volume output muted ${mute}"`);
    } catch (error) {
      console.error('Error setting mute state:', error);
      throw error;
    }
  }

  /**
   * Toggle the mute state of the system audio
   * @returns A promise that resolves with the new mute state
   */
  static async toggleMute(): Promise<boolean> {
    try {
      // Get current mute state
      const { stdout } = await execAsync('osascript -e "output muted of (get volume settings)"');
      const isMuted = stdout.trim() === 'true';
      
      // Toggle mute state
      await this.setMute(!isMuted);
      
      return !isMuted;
    } catch (error) {
      console.error('Error toggling mute state:', error);
      throw error;
    }
  }
} 