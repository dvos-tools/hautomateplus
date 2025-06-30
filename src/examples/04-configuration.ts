import { 
  getSystemControlConfig, 
  updateSystemControlConfig, 
  setEndpointEnabled,
  SystemControlService 
} from '../index';

async function configurationDemo() {
  console.log('Configuration Demo');
  console.log('==================');
  
  // Get current configuration
  const initialConfig = getSystemControlConfig();
  console.log('Initial configuration:', initialConfig);
  
  // Disable specific endpoints
  console.log('\nDisabling lock and notification endpoints...');
  setEndpointEnabled('lock', false);
  setEndpointEnabled('notification', false);
  
  const updatedConfig = getSystemControlConfig();
  console.log('Updated configuration:', updatedConfig);
  
  // Try to execute commands (lock will be skipped)
  console.log('\nTrying to execute lock command (should be skipped)...');
  try {
    await SystemControlService.executeCommand({
      action: 'lock',
      message: 'Test lock command'
    });
  } catch (error) {
    console.log('Lock command was skipped (endpoint disabled)');
  }
  
  // Enable all endpoints
  console.log('\nEnabling all endpoints...');
  updateSystemControlConfig({
    volumeUp: true,
    volumeDown: true,
    mute: true,
    unmute: true,
    lock: true,
    notification: true
  });
  
  const allEnabledConfig = getSystemControlConfig();
  console.log('All endpoints enabled:', allEnabledConfig);
  
  // Disable volume control only
  console.log('\nDisabling volume control endpoints...');
  updateSystemControlConfig({
    volumeUp: false,
    volumeDown: false,
    mute: false,
    unmute: false
  });
  
  const volumeDisabledConfig = getSystemControlConfig();
  console.log('Volume control disabled:', volumeDisabledConfig);
  
  // Restore original configuration
  console.log('\nRestoring original configuration...');
  updateSystemControlConfig(initialConfig);
  
  const finalConfig = getSystemControlConfig();
  console.log('Final configuration:', finalConfig);
}

// Run the demo
configurationDemo(); 