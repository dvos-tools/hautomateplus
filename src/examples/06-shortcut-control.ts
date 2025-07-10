import { ShortcutService } from '../services/shortcutService';

/**
 * Example: Using Shortcut Control
 * 
 * This example demonstrates how to trigger macOS Shortcuts from TypeScript
 * using AppleScript with the Shortcuts Events application
 * 
 * Prerequisites:
 * 1. macOS with osascript available (should be available by default)
 * 2. Create a shortcut in the Shortcuts app
 * 3. Note the exact name of your shortcut
 */

async function shortcutControlExample() {
  console.log('=== Shortcut Control Example ===\n');

  // Check if osascript is available
  const isAvailable = await ShortcutService.isAvailable();
  if (!isAvailable) {
    console.error('❌ osascript not available!');
    console.log('This should not happen on macOS. Please check your system.');
    return;
  }

  console.log('✅ osascript is available');
  console.log(`Service info: ${ShortcutService.getServiceInfo()}\n`);

  try {
    // Example 1: Trigger a shortcut without parameters
    console.log('1. Triggering shortcut without parameters...');
    await ShortcutService.triggerShortcut('MyShortcut');
    console.log('✅ Shortcut triggered successfully\n');

    // Example 2: Trigger a shortcut with a parameter
    console.log('2. Triggering shortcut with parameter...');
    await ShortcutService.triggerShortcutWithParameter('ProcessText', 'Hello from TypeScript!');
    console.log('✅ Shortcut triggered with parameter successfully\n');

    // Example 3: Using the main trigger method
    console.log('3. Using main trigger method...');
    await ShortcutService.trigger('AnotherShortcut', 'Custom parameter');
    console.log('✅ Shortcut triggered using main method\n');

    // Example 4: Trigger with special characters (automatically handled)
    console.log('4. Triggering with special characters...');
    await ShortcutService.trigger('TextProcessor', 'Text with spaces & symbols! @#$%');
    console.log('✅ Shortcut triggered with special characters\n');

  } catch (error) {
    console.error('❌ Error triggering shortcut:', error);
  }
}

// Example usage with error handling
async function safeShortcutExample() {
  console.log('=== Safe Shortcut Example ===\n');

  try {
    // Always check availability first
    if (!(await ShortcutService.isAvailable())) {
      throw new Error('osascript not available');
    }

    // Trigger a shortcut with error handling
    await ShortcutService.trigger('MyShortcut', 'Safe parameter');
    console.log('✅ Shortcut executed successfully');

  } catch (error) {
    console.error('❌ Failed to execute shortcut:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('not available')) {
        console.log('💡 Solution: This should not happen on macOS. Check your system installation.');
      } else if (error.message.includes('Failed to trigger shortcut')) {
        console.log('💡 Solution: Make sure the shortcut name is correct and exists in Shortcuts app');
      }
    }
  }
}

// Run examples
async function main() {
  await shortcutControlExample();
  console.log('\n' + '='.repeat(50) + '\n');
  await safeShortcutExample();
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { shortcutControlExample, safeShortcutExample }; 