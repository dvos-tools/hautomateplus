import { VolumeControl } from '../index';

async function volumeControlDemo() {
  console.log('Volume Control Demo');
  console.log('==================');
  
  try {
    // Get current volume
    const currentVolume = await VolumeControl.getVolume();
    console.log(`Current volume: ${currentVolume}%`);
    
    // Increase volume by 10
    console.log('Increasing volume by 10...');
    await VolumeControl.increaseVolume(10);
    
    // Get updated volume
    const newVolume = await VolumeControl.getVolume();
    console.log(`New volume: ${newVolume}%`);
    
    // Decrease volume by 5
    console.log('Decreasing volume by 5...');
    await VolumeControl.decreaseVolume(5);
    
    // Get final volume
    const finalVolume = await VolumeControl.getVolume();
    console.log(`Final volume: ${finalVolume}%`);
    
    // Toggle mute
    console.log('Toggling mute...');
    const isMuted = await VolumeControl.toggleMute();
    console.log(`Audio is now ${isMuted ? 'muted' : 'unmuted'}`);
    
    // Unmute
    console.log('Unmuting...');
    await VolumeControl.setMute(false);
    console.log('Audio unmuted');
    
    // Set volume to 50%
    console.log('Setting volume to 50%...');
    await VolumeControl.setVolume(50);
    console.log('Volume set to 50%');
    
  } catch (error) {
    console.error('Volume control error:', error);
  }
}

// Run the demo
volumeControlDemo(); 