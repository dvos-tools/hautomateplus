import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeviceInfo {
  deviceName: string;
  batteryLevel: number;
  isCharging: boolean;
  isConnected: boolean;
  lastUpdate: string;
}

export interface BatteryInfo {
  level: number;
  isCharging: boolean;
}

/**
 * Service for gathering device information on macOS
 * Provides battery status, device name, and connection information
 */
export class DeviceInfoService {
  private static deviceName: string | null = null;

  /**
   * Get the device hostname (used for entity naming)
   * @returns Promise that resolves to the device hostname
   */
  static async getDeviceName(): Promise<string> {
    if (this.deviceName) {
      return this.deviceName;
    }

    try {
      const { stdout } = await execAsync('hostname');
      this.deviceName = stdout.trim();
      return this.deviceName;
    } catch (error) {
      console.error('Error getting device name:', error);
      // Fallback to a default name
      this.deviceName = 'macOS-Device';
      return this.deviceName;
    }
  }

  /**
   * Get battery information using system_profiler
   * @returns Promise that resolves to battery information
   */
  static async getBatteryInfo(): Promise<BatteryInfo> {
    try {
      // Get battery information using system_profiler
      const { stdout } = await execAsync('system_profiler SPPowerDataType -json');
      const powerData = JSON.parse(stdout);
      
      // Extract battery information
      const batteryInfo = powerData.SPPowerDataType?.[0]?.sppower_battery_health_info?.[0];
      
      if (!batteryInfo) {
        // No battery found (desktop Mac)
        return {
          level: 100,
          isCharging: false
        };
      }

      // Extract battery level
      const capacity = batteryInfo.sppower_battery_health_info?.sppower_battery_health_capacity_percent;
      const level = capacity ? parseInt(capacity, 10) : 100;

      // Extract charging status
      const isCharging = batteryInfo.sppower_battery_health_info?.sppower_battery_health_is_charging === 'TRUE';

      return {
        level: Math.max(0, Math.min(100, level)),
        isCharging: isCharging || false
      };

    } catch (error) {
      console.error('Error getting battery info:', error);
      // Fallback values
      return {
        level: 100,
        isCharging: false
      };
    }
  }

  /**
   * Get complete device information
   * @param isConnected Whether the device is currently connected to Home Assistant
   * @returns Promise that resolves to complete device information
   */
  static async getDeviceInfo(isConnected: boolean = true): Promise<DeviceInfo> {
    const [deviceName, batteryInfo] = await Promise.all([
      this.getDeviceName(),
      this.getBatteryInfo()
    ]);

    return {
      deviceName,
      batteryLevel: batteryInfo.level,
      isCharging: batteryInfo.isCharging,
      isConnected,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Check if the device has a battery (laptop vs desktop)
   * @returns Promise that resolves to true if device has battery
   */
  static async hasBattery(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('system_profiler SPPowerDataType -json');
      const powerData = JSON.parse(stdout);
      const batteryInfo = powerData.SPPowerDataType?.[0]?.sppower_battery_health_info?.[0];
      return !!batteryInfo;
    } catch (error) {
      console.error('Error checking battery availability:', error);
      return false;
    }
  }
} 