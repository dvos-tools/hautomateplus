import { 
  SystemControlConfig, 
  getSystemControlConfig, 
  updateSystemControlConfig, 
  setEndpointEnabled 
} from '../config/systemControlConfig';

/**
 * API for managing system control endpoints
 */
export class SystemControlApi {
  /**
   * Get the current configuration of all system control endpoints
   * @returns The current configuration
   */
  static getConfig(): SystemControlConfig {
    return getSystemControlConfig();
  }
  
  /**
   * Update the configuration of system control endpoints
   * @param config Partial configuration to update
   * @returns The updated configuration
   */
  static updateConfig(config: Partial<SystemControlConfig>): SystemControlConfig {
    return updateSystemControlConfig(config);
  }
  
  /**
   * Enable or disable a specific system control endpoint
   * @param endpoint The endpoint to enable/disable
   * @param enabled Whether the endpoint should be enabled
   * @returns The updated configuration
   */
  static setEndpointEnabled(endpoint: keyof SystemControlConfig, enabled: boolean): SystemControlConfig {
    return setEndpointEnabled(endpoint, enabled);
  }
  
  /**
   * Enable all system control endpoints
   * @returns The updated configuration
   */
  static enableAllEndpoints(): SystemControlConfig {
    const allEnabled: SystemControlConfig = {
      volumeUp: true,
      volumeDown: true,
      mute: true,
      unmute: true,
      lock: true,
      notification: true
    };
    
    return updateSystemControlConfig(allEnabled);
  }
  
  /**
   * Disable all system control endpoints
   * @returns The updated configuration
   */
  static disableAllEndpoints(): SystemControlConfig {
    const allDisabled: SystemControlConfig = {
      volumeUp: false,
      volumeDown: false,
      mute: false,
      unmute: false,
      lock: false,
      notification: false
    };
    
    return updateSystemControlConfig(allDisabled);
  }
} 