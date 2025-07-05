import { VolumeService } from '../index';

async function volumeControlDemo() {
  console.log('🎵 Volume Control Demo');
  console.log('=====================');
  
  try {
    // Check if native binary is available
    const isAvailable = await VolumeService.isAvailable();
    if (!isAvailable) {
      console.log('❌ Native volume control binary not found!');
      console.log('   Run: npm run build:native');
      return;
    }
    
    console.log('✅ Native volume control is available\n');
    
    // Get current volume
    const currentVolume = await VolumeService.getVolume();
    console.log(`📊 Current volume: ${currentVolume}%`);
    
    // Increase volume by 10
    console.log('\n🔊 Increasing volume by 10...');
    await VolumeService.increaseVolume(10);
    
    // Get updated volume
    const newVolume = await VolumeService.getVolume();
    console.log(`📊 New volume: ${newVolume}%`);
    
    // Decrease volume by 5
    console.log('\n🔉 Decreasing volume by 5...');
    await VolumeService.decreaseVolume(5);
    
    // Get final volume
    const finalVolume = await VolumeService.getVolume();
    console.log(`📊 Final volume: ${finalVolume}%`);
    
    // Toggle mute
    console.log('\n🔄 Toggling mute...');
    const isMuted = await VolumeService.toggleMute();
    console.log(`📊 Audio is now ${isMuted ? 'muted' : 'unmuted'}`);
    
    // Unmute
    console.log('\n🔊 Unmuting...');
    await VolumeService.unmute();
    console.log('✅ Audio unmuted');
    
    // Set volume to 50%
    console.log('\n🎛️  Setting volume to 50%...');
    await VolumeService.setVolume(50);
    console.log('✅ Volume set to 50%');
    
    console.log('\n✅ Volume control demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Volume control error:', error);
  }
}

// Run the demo
volumeControlDemo(); 