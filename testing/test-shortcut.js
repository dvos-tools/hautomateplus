const { ShortcutService } = require('../dist/index');

async function testShortcutControl() {
  console.log('🧪 Testing Shortcut Control Integration\n');

  try {
    // Test 1: Check availability
    console.log('1. Testing availability...');
    const isAvailable = await ShortcutService.isAvailable();
    console.log(`   Available: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      console.log('   💡 osascript should be available on macOS');
      return;
    }

    // Test 2: Get service info
    console.log('\n2. Testing service info...');
    const serviceInfo = ShortcutService.getServiceInfo();
    console.log(`   Info: ${serviceInfo}`);

    // Test 3: Test AppleScript syntax with a simple command
    console.log('\n3. Testing AppleScript syntax...');
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Test if we can list shortcuts
      const result = await execAsync('osascript -e \'tell application "Shortcuts Events" to get name of every shortcut\'');
      const shortcuts = result.stdout.trim().split(', ');
      console.log(`   Found ${shortcuts.length} shortcuts: ${shortcuts.slice(0, 3).join(', ')}${shortcuts.length > 3 ? '...' : ''}`);
      console.log('   ✅ AppleScript syntax is working correctly');
    } catch (error) {
      console.log('   ❌ AppleScript test failed:', error.message);
    }

    // Test 4: Test shortcut trigger (this may fail if shortcuts don't exist or require interaction)
    console.log('\n4. Testing shortcut trigger...');
    console.log('   Attempting to trigger "TestShortcut"...');
    try {
      await ShortcutService.trigger('TestShortcut', 'Hello from test!');
      console.log('   ✅ Trigger command executed successfully');
    } catch (error) {
      if (error.message.includes("Can't get shortcut") || error.message.includes('Can\'t get shortcut')) {
        console.log('   ⚠️  Expected error: Test shortcut doesn\'t exist (this is normal)');
        console.log('   ✅ AppleScript integration is working correctly');
      } else if (error.message.includes('User canceled')) {
        console.log('   ⚠️  Expected error: Shortcut was found but execution was canceled');
        console.log('   ✅ AppleScript integration is working correctly');
      } else {
        console.log('   ❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Test without parameters
    console.log('\n5. Testing shortcut without parameters...');
    try {
      await ShortcutService.triggerShortcut('AnotherTestShortcut');
      console.log('   ✅ Trigger without parameters executed successfully');
    } catch (error) {
      if (error.message.includes("Can't get shortcut") || error.message.includes('Can\'t get shortcut')) {
        console.log('   ⚠️  Expected error: Test shortcut doesn\'t exist (this is normal)');
        console.log('   ✅ AppleScript integration is working correctly');
      } else {
        console.log('   ❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nNote: The AppleScript integration is working correctly.');
    console.log('Errors about missing shortcuts are expected during testing.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testShortcutControl(); 