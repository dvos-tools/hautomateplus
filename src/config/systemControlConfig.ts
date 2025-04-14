/**
 * Configuration for system control endpoints
 * This allows users to selectively enable/disable specific functionality
 */
export interface SystemControlConfig {
  // Volume control endpoints
  volumeUp: boolean;
  volumeDown: boolean;
  mute: boolean;
  unmute: boolean;
  
  // System control endpoints
  lock: boolean;
  
  // Notification endpoints
  notification: boolean;
}

/**
 * Default configuration with all endpoints enabled
 */
export const defaultSystemControlConfig: SystemControlConfig = {
  // Volume control endpoints
  volumeUp: true,
  volumeDown: true,
  mute: true,
  unmute: true,
  
  // System control endpoints
  lock: true,
  
  // Notification endpoints
  notification: true
};

/**
 * Current configuration for system control endpoints
 * This can be modified at runtime to enable/disable specific functionality
 */
let currentConfig: SystemControlConfig = { ...defaultSystemControlConfig };

/**
 * Get the current system control configuration
 * @returns The current configuration
 */
export function getSystemControlConfig(): SystemControlConfig {
  return { ...currentConfig };
}

/**
 * Update the system control configuration
 * @param config Partial configuration to update
 * @returns The updated configuration
 */
export function updateSystemControlConfig(config: Partial<SystemControlConfig>): SystemControlConfig {
  currentConfig = { ...currentConfig, ...config };
  return { ...currentConfig };
}

/**
 * Enable or disable a specific system control endpoint
 * @param endpoint The endpoint to enable/disable
 * @param enabled Whether the endpoint should be enabled
 * @returns The updated configuration
 */
export function setEndpointEnabled(endpoint: keyof SystemControlConfig, enabled: boolean): SystemControlConfig {
  currentConfig[endpoint] = enabled;
  return { ...currentConfig };
}

/**
 * Check if a specific system control endpoint is enabled
 * @param endpoint The endpoint to check
 * @returns Whether the endpoint is enabled
 */
export function isEndpointEnabled(endpoint: keyof SystemControlConfig): boolean {
  return currentConfig[endpoint];
} 