import { ShortcutService } from '../services/shortcutService';

/**
 * Example: Using Shortcut Control
 * 
 * This example demonstrates how to trigger macOS Shortcuts from TypeScript
 * 
 * Prerequisites:
 * 1. Build the native binary: npm run build:native
 * 2. Create a shortcut in the Shortcuts app
 * 3. Note the exact name of your shortcut
 */

async function shortcutControlExample() {
  console.log('=== Shortcut Control Example ===\n');

  // Check if the native binary is available
  const isAvailable = await ShortcutService.isAvailable();
  if (!isAvailable) {
    console.error('❌ Native shortcut control binary not found!');
    console.log('Please build the native binary first: npm run build:native');
    return;
  }

  console.log('✅ Native shortcut control binary is available');
  console.log(`Binary path: ${ShortcutService.getBinaryPath()}\n`);

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
      throw new Error('Native binary not available');
    }

    // Trigger a shortcut with error handling
    await ShortcutService.trigger('MyShortcut', 'Safe parameter');
    console.log('✅ Shortcut executed successfully');

  } catch (error) {
    console.error('❌ Failed to execute shortcut:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('not available')) {
        console.log('💡 Solution: Run "npm run build:native" to build the binary');
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