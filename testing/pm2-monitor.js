#!/usr/bin/env node

/**
 * PM2 Monitoring Script
 * This script helps monitor and diagnose issues with the PM2-managed Home Assistant app
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const APP_NAME = 'home-assistant-local-control';

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

async function checkPM2Status() {
  try {
    console.log('🔍 Checking PM2 Status...');
    const status = await runCommand('pm2 status');
    console.log(status);
    
    // Check if our app is running
    const list = await runCommand('pm2 list');
    if (list.includes(APP_NAME)) {
      console.log('\n✅ App is registered with PM2');
      
      // Get detailed info
      const info = await runCommand(`pm2 show ${APP_NAME}`);
      console.log('\n📊 App Details:');
      console.log(info);
      
      // Check logs
      console.log('\n📝 Recent Logs:');
      const logs = await runCommand(`pm2 logs ${APP_NAME} --lines 20 --nostream`);
      console.log(logs);
      
    } else {
      console.log('\n❌ App is not running in PM2');
      console.log('   Start it with: pm2 start ecosystem.config.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking PM2 status:', error.message);
  }
}

async function checkSystemResources() {
  try {
    console.log('\n💻 System Resources:');
    
    // Check memory usage
    const memory = await runCommand('ps aux | grep node | grep -v grep');
    console.log('Memory usage:');
    console.log(memory);
    
    // Check disk space
    const disk = await runCommand('df -h .');
    console.log('\nDisk space:');
    console.log(disk);
    
    // Check network connections
    const network = await runCommand('netstat -an | grep ESTABLISHED | wc -l');
    console.log(`\nActive network connections: ${network}`);
    
  } catch (error) {
    console.error('❌ Error checking system resources:', error.message);
  }
}

async function checkEnvironment() {
  try {
    console.log('\n🌍 Environment Check:');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env file exists');
      
      // Check if required variables are set
      const envContent = fs.readFileSync(envPath, 'utf8');
      const hasHAUrl = envContent.includes('HA_URL=');
      const hasToken = envContent.includes('HA_ACCESS_TOKEN=');
      
      console.log(`   HA_URL configured: ${hasHAUrl ? '✅' : '❌'}`);
      console.log(`   HA_ACCESS_TOKEN configured: ${hasToken ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ .env file not found');
      console.log('   Copy .env.example to .env and configure your settings');
    }
    
    // Check Node.js version
    const nodeVersion = await runCommand('node --version');
    console.log(`   Node.js version: ${nodeVersion}`);
    
    // Check if dist folder exists
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      console.log('✅ Built files exist');
    } else {
      console.log('❌ Built files missing - run: npm run build');
    }
    
  } catch (error) {
    console.error('❌ Error checking environment:', error.message);
  }
}

async function restartApp() {
  try {
    console.log('\n🔄 Restarting app...');
    await runCommand(`pm2 restart ${APP_NAME}`);
    console.log('✅ App restarted');
    
    // Wait a moment and check status
    setTimeout(async () => {
      console.log('\n📊 Status after restart:');
      const status = await runCommand(`pm2 show ${APP_NAME}`);
      console.log(status);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error restarting app:', error.message);
  }
}

async function main() {
  console.log('🚀 PM2 Monitor for Home Assistant Local Control');
  console.log('==============================================');
  
  await checkEnvironment();
  await checkPM2Status();
  await checkSystemResources();
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('   1. If app is not running: pm2 start ecosystem.config.js');
  console.log('   2. If app is stuck: pm2 restart home-assistant-local-control');
  console.log('   3. To view live logs: pm2 logs home-assistant-local-control');
  console.log('   4. To stop app: pm2 stop home-assistant-local-control');
  console.log('   5. To delete app: pm2 delete home-assistant-local-control');
  console.log('   6. To rebuild: npm run build && pm2 restart home-assistant-local-control');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--restart')) {
    await restartApp();
  }
}

main().catch(error => {
  console.error('❌ Monitor failed:', error);
  process.exit(1);
}); 