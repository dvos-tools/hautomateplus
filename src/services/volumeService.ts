import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

/**
 * Native Volume Control using Swift CoreAudio implementation
 * 
 * This provides a more native and efficient way to control system volume
 * 
 * Note: The Swift binary must be built before using this class.
 * Run: npm run build:native
 */
export class VolumeService {
  private static binaryPath = join(__dirname, '../../native/volume/volume_control');

  /**
   * Get the current system volume level (0-100)
   * @returns A promise that resolves with the current volume level
   */
  static async getVolume(): Promise<number> {
    try {
      const { stdout } = await execAsync(`${this.binaryPath} get`);
      return parseInt(stdout.trim(), 10);
    } catch (error) {
      console.error('Error getting volume:', error);
      throw new Error(`Failed to get volume: ${error}`);
    }
  }

  /**
   * Set the system volume level (0-100)
   * @param level The volume level to set (0-100)
   * @returns A promise that resolves when the volume is set
   */
  static async setVolume(level: number): Promise<void> {
    const safeLevel = Math.max(0, Math.min(100, level));
    
    try {
      await execAsync(`${this.binaryPath} set ${safeLevel}`);
    } catch (error) {
      console.error('Error setting volume:', error);
      throw new Error(`Failed to set volume: ${error}`);
    }
  }

  /**
   * Increase the system volume by a specified amount
   * @param amount The amount to increase the volume by (default: 10)
   * @returns A promise that resolves when the volume is increased
   */
  static async increaseVolume(amount: number = 10): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} up ${amount}`);
    } catch (error) {
      console.error('Error increasing volume:', error);
      throw new Error(`Failed to increase volume: ${error}`);
    }
  }

  /**
   * Decrease the system volume by a specified amount
   * @param amount The amount to decrease the volume by (default: 10)
   * @returns A promise that resolves when the volume is decreased
   */
  static async decreaseVolume(amount: number = 10): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} down ${amount}`);
    } catch (error) {
      console.error('Error decreasing volume:', error);
      throw new Error(`Failed to decrease volume: ${error}`);
    }
  }

  /**
   * Mute the system audio
   * @returns A promise that resolves when the audio is muted
   */
  static async mute(): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} mute`);
    } catch (error) {
      console.error('Error muting audio:', error);
      throw new Error(`Failed to mute audio: ${error}`);
    }
  }

  /**
   * Unmute the system audio
   * @returns A promise that resolves when the audio is unmuted
   */
  static async unmute(): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} unmute`);
    } catch (error) {
      console.error('Error unmuting audio:', error);
      throw new Error(`Failed to unmute audio: ${error}`);
    }
  }

  /**
   * Toggle the mute state of the system audio
   * @returns A promise that resolves with the new mute state
   */
  static async toggleMute(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.binaryPath} toggle`);
      return stdout.includes('muted');
    } catch (error) {
      console.error('Error toggling mute state:', error);
      throw new Error(`Failed to toggle mute: ${error}`);
    }
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
} 