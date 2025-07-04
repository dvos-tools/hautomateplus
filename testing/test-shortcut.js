const { ShortcutService } = require('../dist/index');

async function testShortcutControl() {
  console.log('🧪 Testing Shortcut Control Integration\n');

  try {
    // Test 1: Check availability
    console.log('1. Testing availability...');
    const isAvailable = await ShortcutService.isAvailable();
    console.log(`   Available: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      console.log('   💡 Run: npm run build:native');
      return;
    }

    // Test 2: Get binary path
    console.log('\n2. Testing binary path...');
    const binaryPath = ShortcutService.getBinaryPath();
    console.log(`   Path: ${binaryPath}`);

    // Test 3: Trigger a test shortcut (this will attempt to open Shortcuts app)
    console.log('\n3. Testing shortcut trigger...');
    console.log('   Attempting to trigger "TestShortcut"...');
    await ShortcutService.trigger('TestShortcut', 'Hello from test!');
    console.log('   ✅ Trigger command executed successfully');

    // Test 4: Test without parameters
    console.log('\n4. Testing shortcut without parameters...');
    await ShortcutService.triggerShortcut('AnotherTestShortcut');
    console.log('   ✅ Trigger without parameters executed successfully');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nNote: If shortcuts don\'t exist, the Shortcuts app will show an error,');
    console.log('but the TypeScript integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testShortcutControl(); 