#!/usr/bin/env node

/**
 * Test Device Information
 * This script tests the device information gathering functionality
 */

const { DeviceInfoService } = require('../dist/services/deviceInfoService');

async function testDeviceInfo() {
  console.log('🔍 Testing Device Information');
  console.log('==============================');
  
  try {
    // Test device name
    console.log('\n📱 Device Name:');
    const deviceName = await DeviceInfoService.getDeviceName();
    console.log(`   Device Name: ${deviceName}`);
    
    // Test battery information
    console.log('\n🔋 Battery Information:');
    const batteryInfo = await DeviceInfoService.getBatteryInfo();
    console.log(`   Battery Level: ${batteryInfo.level}%`);
    console.log(`   Is Charging: ${batteryInfo.isCharging}`);
    
    // Test if device has battery
    console.log('\n🔌 Battery Availability:');
    const hasBattery = await DeviceInfoService.hasBattery();
    console.log(`   Has Battery: ${hasBattery}`);
    
    // Test complete device info
    console.log('\n📊 Complete Device Information:');
    const deviceInfo = await DeviceInfoService.getDeviceInfo(true);
    console.log('   Device Info:', JSON.stringify(deviceInfo, null, 2));
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

// Run the test
testDeviceInfo(); 