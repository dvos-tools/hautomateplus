#!/usr/bin/env node

/**
 * Test script for Home Assistant connection
 * This script helps diagnose connection issues and test the app's functionality
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { HomeAssistantClient } = require('../dist/index');

const HA_URL = process.env.HA_URL;
const HA_ACCESS_TOKEN = process.env.HA_ACCESS_TOKEN;

if (!HA_URL || !HA_ACCESS_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   HA_URL and HA_ACCESS_TOKEN must be set in .env file');
  console.error('   Copy .env.example to .env and fill in your values');
  process.exit(1);
}

console.log('🧪 Home Assistant Connection Test');
console.log('================================');
console.log(`URL: ${HA_URL}`);
console.log(`Token: ${HA_ACCESS_TOKEN.substring(0, 10)}...`);
console.log('');

// Test connection
async function testConnection() {
  const client = new HomeAssistantClient(HA_URL, HA_ACCESS_TOKEN);
  
  let testCompleted = false;
  let healthCheckInterval;
  
  // Set up event listeners
  client.on('local_control_event', (event) => {
    console.log('✅ Received local control event:', event.data);
  });
  
  client.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
    if (!testCompleted) {
      testCompleted = true;
      cleanup();
      process.exit(1);
    }
  });
  
  // Health check every 5 seconds
  healthCheckInterval = setInterval(() => {
    const health = client.getConnectionHealth();
    const stats = client.getConnectionStats();
    
    console.log(`\n🔍 Health Check (${new Date().toLocaleTimeString()}):`);
    console.log(`   Status: ${health.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Quality: ${health.connectionQuality.toUpperCase()}`);
    console.log(`   Latency: ${health.latency ? `${health.latency}ms` : 'N/A'}`);
    console.log(`   Last Heartbeat: ${health.lastHeartbeat ? health.lastHeartbeat.toLocaleTimeString() : 'Never'}`);
    console.log(`   Missed Heartbeats: ${health.missedHeartbeats}`);
    console.log(`   Total Connections: ${stats.totalConnections}`);
    console.log(`   Successful: ${stats.successfulConnections}`);
    console.log(`   Failed: ${stats.failedConnections}`);
    console.log(`   Reconnects: ${stats.totalReconnects}`);
    console.log(`   Uptime: ${Math.round(stats.connectionUptime / 1000)}s`);
    
    // If we've been running for 30 seconds and everything looks good, exit
    if (stats.connectionUptime > 30000 && health.isHealthy) {
      console.log('\n✅ Connection test completed successfully!');
      testCompleted = true;
      cleanup();
      process.exit(0);
    }
  }, 5000);
  
  function cleanup() {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
    client.close();
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    testCompleted = true;
    cleanup();
    process.exit(0);
  });
  
  // Timeout after 2 minutes
  setTimeout(() => {
    if (!testCompleted) {
      console.log('\n⏰ Test timed out after 2 minutes');
      testCompleted = true;
      cleanup();
      process.exit(1);
    }
  }, 120000);
}

// Run the test
testConnection().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 