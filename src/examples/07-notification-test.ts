import { NotificationService } from '../services/NotificationService';

/**
 * Simple test for basic notifications using UserNotifications framework
 */

async function testBasicNotifications() {
  console.log('=== Basic Notification Test ===\n');

  try {
    // Check if native binary is available
    const isAvailable = await NotificationService.isAvailable();
    if (!isAvailable) {
      console.log('❌ Native notification binary not found. Please run: npm run build:native');
      return;
    }
    console.log('✅ Native notification binary found\n');

    // Check current permission status
    const permissionStatus = await NotificationService.checkPermission();
    console.log(`📋 Current permission status: ${permissionStatus}\n`);

    // Test basic notification
    console.log('1️⃣ Testing basic notification...');
    await NotificationService.displayNotification(
      'This is a test notification using UserNotifications framework',
      'UserNotifications Test',
      'Native macOS notifications'
    );
    console.log('✅ Basic notification sent successfully\n');

    // Test notification with category
    console.log('2️⃣ Testing notification with category...');
    await NotificationService.displayNotification(
      'This notification has a custom category',
      'Category Test',
      'Testing categories',
      'test-category'
    );
    console.log('✅ Category notification sent successfully\n');

    // List categories
    console.log('3️⃣ Listing notification categories...');
    await NotificationService.listCategories();
    console.log('✅ Categories listed successfully\n');

    // Clear notifications
    console.log('4️⃣ Clearing all notifications...');
    await NotificationService.clearAllNotifications();
    console.log('✅ All notifications cleared\n');

    console.log('=== Test Complete ===');
    console.log('✅ All basic notification tests passed!');
    console.log('The UserNotifications framework is working correctly.');

  } catch (error) {
    console.error('❌ Error in notification test:', error);
  }
}

// Test interactive notification separately
async function testInteractiveNotification() {
  console.log('\n=== Interactive Notification Test ===\n');
  console.log('⚠️  Interactive notifications require user interaction');
  console.log('   This test will show a notification with text input');
  console.log('   Please respond to the notification when it appears\n');

  try {
    console.log('🔄 Showing interactive notification...');
    console.log('   (This will wait for your response - please check your notification center)');
    
    const response = await NotificationService.displayInteractiveNotification({
      title: 'Interactive Test',
      message: 'Please enter a test message:',
      subtitle: 'Testing UserNotifications text input',
      placeholder: 'Enter your message here...',
      buttonText: 'Submit Test',
      timeout: 60000 // 60 seconds
    });

    console.log('✅ Interactive notification response received:');
    console.log(`   - Notification ID: ${response.notificationId}`);
    console.log(`   - Timestamp: ${new Date(response.timestamp * 1000).toISOString()}`);
    console.log(`   - User input: "${response.userText}"`);

  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('⏰ Interactive notification timed out - no response received');
    } else if (error instanceof Error && error.message.includes('cancelled')) {
      console.log('❌ Interactive notification was cancelled by user');
    } else {
      console.log(`❌ Error with interactive notification: ${error}`);
    }
  }
}

// Run the tests
async function main() {
  await testBasicNotifications();
  
  // Test interactive notifications
  await testInteractiveNotification();
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { testBasicNotifications, testInteractiveNotification }; 