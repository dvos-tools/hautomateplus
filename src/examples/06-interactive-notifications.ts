import { NotificationService } from '../services/NotificationService';

/**
 * Example: Interactive Notifications with Text Input
 * 
 * This example demonstrates how to use the enhanced NotificationService
 * to display interactive notifications that can capture user input.
 * 
 * Features demonstrated:
 * - Basic notifications
 * - Interactive notifications with text input
 * - Permission management
 * - Response handling
 * - Timeout handling
 */

async function interactiveNotificationsExample() {
  console.log('=== Interactive Notifications Example ===\n');

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
    console.log(`📋 Current permission status: ${permissionStatus}`);

    // Request permission if needed (skip for command-line tools)
    if (permissionStatus === 'notDetermined') {
      console.log('🔐 Permission not determined - skipping request (command-line limitation)');
      console.log('   Notifications will still work but may not show in notification center\n');
    }

    // Example 1: Basic notification
    console.log('1️⃣ Displaying basic notification...');
    await NotificationService.displayNotification(
      'This is a basic notification',
      'Basic Example',
      'No user interaction required'
    );
    console.log('✅ Basic notification sent\n');

    // Wait a moment before showing interactive notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Example 2: Interactive notification with text input
    console.log('2️⃣ Displaying interactive notification...');
    console.log('   (This will prompt for user input - please respond in the notification)');
    
    try {
      const response = await NotificationService.displayInteractiveNotification({
        title: 'Interactive Example',
        message: 'Please enter your name:',
        subtitle: 'This notification has a text input field',
        placeholder: 'Enter your name here...',
        buttonText: 'Submit Name',
        timeout: 60000 // 60 seconds timeout
      });

      console.log('✅ User responded to interactive notification:');
      console.log(`   - Notification ID: ${response.notificationId}`);
      console.log(`   - Timestamp: ${new Date(response.timestamp * 1000).toISOString()}`);
      console.log(`   - User input: "${response.userText}"\n`);

      // Show a follow-up notification with the user's input
      await NotificationService.displayNotification(
        `Hello, ${response.userText}! Thanks for your input.`,
        'Response Received',
        'Your input was captured successfully'
      );

    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('⏰ Interactive notification timed out - no response received');
      } else if (error instanceof Error && error.message.includes('cancelled')) {
        console.log('❌ Interactive notification was cancelled by user');
      } else {
        console.log(`❌ Error with interactive notification: ${error}`);
      }
    }

    // Example 3: Another interactive notification with different options
    console.log('3️⃣ Displaying another interactive notification...');
    console.log('   (This one has different placeholder text and button)');
    
    try {
      const response2 = await NotificationService.displayInteractiveNotification({
        title: 'Quick Question',
        message: 'What is your favorite color?',
        subtitle: 'This helps us personalize your experience',
        placeholder: 'e.g., blue, red, green...',
        buttonText: 'Save Color',
        timeout: 45000 // 45 seconds timeout
      });

      console.log('✅ User responded to color question:');
      console.log(`   - User input: "${response2.userText}"\n`);

      // Show a confirmation with the color
      await NotificationService.displayNotification(
        `Great choice! ${response2.userText} is a beautiful color.`,
        'Color Saved',
        'Your preference has been recorded'
      );

    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log('⏰ Color question timed out');
      } else if (error instanceof Error && error.message.includes('cancelled')) {
        console.log('❌ Color question was cancelled');
      } else {
        console.log(`❌ Error with color question: ${error}`);
      }
    }

    // Example 4: List notification categories
    console.log('4️⃣ Listing notification categories...');
    await NotificationService.listCategories();
    console.log('✅ Categories listed (AppleScript implementation)\n');

    // Example 5: Clear all notifications
    console.log('\n5️⃣ Clearing all notifications...');
    await NotificationService.clearAllNotifications();
    console.log('✅ All notifications cleared');

  } catch (error) {
    console.error('❌ Error in interactive notifications example:', error);
  }
}

// Example of integrating with Home Assistant
async function homeAssistantIntegrationExample() {
  console.log('\n=== Home Assistant Integration Example ===\n');

  try {
    // Simulate receiving a command from Home Assistant that requires user input
    console.log('🏠 Simulating Home Assistant command requiring user input...');
    
    const response = await NotificationService.displayInteractiveNotification({
      title: 'Home Assistant Command',
      message: 'Enter the temperature for your thermostat:',
      subtitle: 'Command received from Home Assistant',
      placeholder: 'Enter temperature (e.g., 72)',
      buttonText: 'Set Temperature',
      timeout: 30000
    });

    console.log('✅ User set temperature via notification:');
    console.log(`   - Temperature: ${response.userText}°F`);
    
    // Here you would typically send this back to Home Assistant
    // await homeAssistantClient.callService('climate', 'set_temperature', {
    //   entity_id: 'climate.living_room',
    //   temperature: parseFloat(response.userText)
    // });
    
    console.log('📡 Temperature would be sent to Home Assistant here');

  } catch (error) {
    console.log(`❌ Error in Home Assistant integration: ${error}`);
  }
}

// Example of local processing
async function localProcessingExample() {
  console.log('\n=== Local Processing Example ===\n');

  try {
    console.log('💻 Simulating local command requiring user input...');
    
    const response = await NotificationService.displayInteractiveNotification({
      title: 'System Command',
      message: 'Enter a command to execute:',
      subtitle: 'Local system command',
      placeholder: 'e.g., ls -la, pwd, whoami',
      buttonText: 'Execute',
      timeout: 30000
    });

    console.log('✅ User entered command via notification:');
    console.log(`   - Command: ${response.userText}`);
    
    // Here you would typically execute the command locally
    // const { exec } = require('child_process');
    // exec(response.userText, (error, stdout, stderr) => {
    //   // Handle command execution
    // });
    
    console.log('⚡ Command would be executed locally here');

  } catch (error) {
    console.log(`❌ Error in local processing: ${error}`);
  }
}

// Run the examples
async function main() {
  await interactiveNotificationsExample();
  await homeAssistantIntegrationExample();
  await localProcessingExample();
  
  console.log('\n=== Example Complete ===');
  console.log('The interactive notification system is now ready for use!');
  console.log('You can integrate this with Home Assistant or use it for local processing.');
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { interactiveNotificationsExample, homeAssistantIntegrationExample, localProcessingExample }; 