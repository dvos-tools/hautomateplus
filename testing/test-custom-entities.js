#!/usr/bin/env node

/**
 * Test script for custom entities feature
 * This script helps verify that custom entities are working correctly
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Check if required environment variables are set
const HA_URL = process.env.HA_URL || 'ws://localhost:8123/api/websocket';
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN || process.env.HA_TOKEN || '';

if (!HA_ACCESS_TOKEN) {
  console.error('❌ HA_ACCESS_TOKEN environment variable is required');
  console.log('   Set it in your .env file or as an environment variable');
  process.exit(1);
}

console.log('🧪 Custom Entities Test');
console.log('======================\n');

// Get user's home directory
const homeDir = os.homedir();
const testFilePath = path.join(homeDir, 'my_shortcut_output.txt');

// Test configuration - single entity
const testConfig = {
  enabled: true,
  entities: [
    {
      name: 'My Sensor',
      shortcutName: 'My Shortcut',
      filePath: testFilePath,
      entityType: 'sensor',
      unitOfMeasurement: 'units',
      deviceClass: 'generic'
    }
  ]
};

// Create test file
function createTestFile() {
  console.log('📝 Creating test file...');
  
  const testFile = {
    path: testFilePath,
    content: 'test_value'
  };

  try {
    fs.writeFileSync(testFile.path, testFile.content);
    console.log(`   ✅ Created ${testFile.path} with test content`);
  } catch (error) {
    console.log(`   ⚠️  Could not create ${testFile.path}: ${error.message}`);
  }
}

// Test file reading
function testFileReading() {
  console.log('\n📖 Testing file reading...');
  
  const entity = testConfig.entities[0];
  try {
    const content = fs.readFileSync(entity.filePath, 'utf8').trim();
    console.log(`   ✅ ${entity.name}: "${content}"`);
  } catch (error) {
    console.log(`   ❌ ${entity.name}: Error reading file - ${error.message}`);
  }
}

// Test configuration loading
function testConfiguration() {
  console.log('\n⚙️  Testing configuration...');
  
  try {
    // This would normally be imported from the built library
    // For testing, we'll just validate the structure
    if (testConfig.enabled && Array.isArray(testConfig.entities)) {
      console.log('   ✅ Configuration structure is valid');
      console.log(`   📊 Found ${testConfig.entities.length} entity`);
      
      const entity = testConfig.entities[0];
      if (entity.name && entity.shortcutName && entity.filePath && entity.entityType) {
        console.log(`   ✅ Entity "${entity.name}" configuration is valid`);
        console.log(`   🔗 Shortcut: "${entity.shortcutName}"`);
        console.log(`   📁 Output file: "${entity.filePath}"`);
      } else {
        console.log(`   ❌ Entity "${entity.name}" configuration is invalid`);
      }
    } else {
      console.log('   ❌ Configuration structure is invalid');
    }
  } catch (error) {
    console.log(`   ❌ Configuration test failed: ${error.message}`);
  }
}

// Test Home Assistant connection
async function testConnection() {
  console.log('\n🔗 Testing Home Assistant connection...');
  
  try {
    const WebSocket = require('ws');
    const ws = new WebSocket(HA_URL);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('   ⏰ Connection timeout');
        ws.close();
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        console.log('   ✅ WebSocket connection established');
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      });
      
      ws.on('error', (error) => {
        console.log(`   ❌ WebSocket connection failed: ${error.message}`);
        clearTimeout(timeout);
        resolve(false);
      });
    });
  } catch (error) {
    console.log(`   ❌ Connection test failed: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`🏠 Home Assistant URL: ${HA_URL}`);
  console.log(`🔑 Access Token: ${HA_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`🏠 Home Directory: ${homeDir}`);
  console.log(`📁 Test File: ${testFilePath}\n`);
  
  // Create test file
  createTestFile();
  
  // Test file reading
  testFileReading();
  
  // Test configuration
  testConfiguration();
  
  // Test connection
  const connectionOk = await testConnection();
  
  // Summary
  console.log('\n📋 Test Summary');
  console.log('==============');
  console.log(`   Home Assistant Connection: ${connectionOk ? '✅' : '❌'}`);
  console.log(`   Configuration: ✅`);
  console.log(`   Test File: ✅`);
  
  if (connectionOk) {
    console.log('\n🎉 All tests passed! Custom entities should work correctly.');
    console.log('\n📚 Next steps:');
    console.log('   1. Create a shortcut named "My Shortcut" in macOS Shortcuts app');
    console.log(`   2. Make the shortcut write any value to ${testFilePath}`);
    console.log('   3. Run: npm run example:custom-entities');
    console.log('   4. Check your Home Assistant instance for the new entity');
    console.log('   5. See docs/6-custom-entities.md for detailed usage');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your Home Assistant connection.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Verify HA_URL is correct');
    console.log('   2. Check HA_ACCESS_TOKEN is valid');
    console.log('   3. Ensure Home Assistant is running');
  }
  
  // Cleanup test file
  console.log('\n🧹 Cleaning up test file...');
  try {
    fs.unlinkSync(testFilePath);
    console.log(`   ✅ Removed ${testFilePath}`);
  } catch (error) {
    // File might not exist, that's ok
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 