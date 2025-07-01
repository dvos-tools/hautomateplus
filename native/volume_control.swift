import Foundation
import CoreAudio

// Main function
func main() {
    let args = CommandLine.arguments
    guard args.count > 1 else {
        print("Usage: volume_control <command> [value]")
        print("Commands: get, set <0-100>, up <amount>, down <amount>, mute, unmute, toggle")
        exit(1)
    }
    
    let command = args[1]
    
    do {
        switch command {
        case "get":
            let volume = try getVolume()
            print(volume)
        case "set":
            guard args.count > 2, let value = Int(args[2]) else {
                print("Error: set command requires a volume value (0-100)")
                exit(1)
            }
            try setVolume(value)
            print("Volume set to \(value)")
        case "up":
            let amount = args.count > 2 ? Int(args[2]) ?? 10 : 10
            try increaseVolume(amount)
            print("Volume increased by \(amount)")
        case "down":
            let amount = args.count > 2 ? Int(args[2]) ?? 10 : 10
            try decreaseVolume(amount)
            print("Volume decreased by \(amount)")
        case "mute":
            try setMute(true)
            print("Audio muted")
        case "unmute":
            try setMute(false)
            print("Audio unmuted")
        case "toggle":
            let isMuted = try toggleMute()
            print(isMuted ? "Audio muted" : "Audio unmuted")
        default:
            print("Unknown command: \(command)")
            exit(1)
        }
    } catch {
        print("Error: \(error)")
        exit(1)
    }
}

func getCurrentOutputDeviceID() throws -> AudioDeviceID {
    // Get all available audio devices
    var propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDevices,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    
    var dataSize: UInt32 = 0
    var result = AudioObjectGetPropertyDataSize(
        AudioObjectID(kAudioObjectSystemObject),
        &propertyAddress,
        0,
        nil,
        &dataSize
    )
    
    if result != noErr {
        throw VolumeControlError.failedToGetDevice
    }
    
    let deviceCount = Int(dataSize) / MemoryLayout<AudioDeviceID>.size
    var deviceIDs = [AudioDeviceID](repeating: 0, count: deviceCount)
    
    result = AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &propertyAddress,
        0,
        nil,
        &dataSize,
        &deviceIDs
    )
    
    if result != noErr {
        throw VolumeControlError.failedToGetDevice
    }
    
    // Find the device that is currently outputting audio
    for deviceID in deviceIDs {
        // Check if this device is an output device
        var hasOutput = false
        var size = UInt32(MemoryLayout<UInt32>.size)
        propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyStreamConfiguration,
            mScope: kAudioDevicePropertyScopeOutput,
            mElement: 0
        )
        
        result = AudioObjectGetPropertyDataSize(deviceID, &propertyAddress, 0, nil, &size)
        if result == noErr && size > 0 {
            hasOutput = true
        }
        
        if hasOutput {
            // Check if this device is currently active (has non-zero volume)
            var volume: Float32 = 0
            size = UInt32(MemoryLayout<Float32>.size)
            propertyAddress = AudioObjectPropertyAddress(
                mSelector: kAudioDevicePropertyVolumeScalar,
                mScope: kAudioDevicePropertyScopeOutput,
                mElement: 0
            )
            
            result = AudioObjectGetPropertyData(deviceID, &propertyAddress, 0, nil, &size, &volume)
            if result == noErr && volume > 0 {
                return deviceID
            }
        }
    }
    
    // If no active device found, fall back to default output device
    var deviceID = AudioDeviceID(0)
    var size = UInt32(MemoryLayout<AudioDeviceID>.size)
    propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioHardwarePropertyDefaultOutputDevice,
        mScope: kAudioObjectPropertyScopeGlobal,
        mElement: kAudioObjectPropertyElementMain
    )
    
    result = AudioObjectGetPropertyData(
        AudioObjectID(kAudioObjectSystemObject),
        &propertyAddress,
        0,
        nil,
        &size,
        &deviceID
    )
    
    if result != noErr {
        throw VolumeControlError.failedToGetDevice
    }
    
    return deviceID
}

func getVolume() throws -> Int {
    let deviceID = try getCurrentOutputDeviceID()
    var volume: Float32 = 0
    var size = UInt32(MemoryLayout<Float32>.size)
    var propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioDevicePropertyVolumeScalar,
        mScope: kAudioDevicePropertyScopeOutput,
        mElement: 0
    )
    let result = AudioObjectGetPropertyData(
        deviceID,
        &propertyAddress,
        0,
        nil,
        &size,
        &volume
    )
    if result != noErr {
        throw VolumeControlError.failedToGetVolume
    }
    return Int(volume * 100)
}

func setVolume(_ level: Int) throws {
    let deviceID = try getCurrentOutputDeviceID()
    var volume = Float32(max(0, min(100, level))) / 100.0
    var propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioDevicePropertyVolumeScalar,
        mScope: kAudioDevicePropertyScopeOutput,
        mElement: 0
    )
    let result = AudioObjectSetPropertyData(
        deviceID,
        &propertyAddress,
        0,
        nil,
        UInt32(MemoryLayout<Float32>.size),
        &volume
    )
    if result != noErr {
        throw VolumeControlError.failedToSetVolume
    }
}

func increaseVolume(_ amount: Int) throws {
    let currentVolume = try getVolume()
    let newVolume = min(100, currentVolume + amount)
    try setVolume(newVolume)
}

func decreaseVolume(_ amount: Int) throws {
    let currentVolume = try getVolume()
    let newVolume = max(0, currentVolume - amount)
    try setVolume(newVolume)
}

func setMute(_ mute: Bool) throws {
    let deviceID = try getCurrentOutputDeviceID()
    var muted: UInt32 = mute ? 1 : 0
    var propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioDevicePropertyMute,
        mScope: kAudioDevicePropertyScopeOutput,
        mElement: 0
    )
    let result = AudioObjectSetPropertyData(
        deviceID,
        &propertyAddress,
        0,
        nil,
        UInt32(MemoryLayout<UInt32>.size),
        &muted
    )
    if result != noErr {
        throw VolumeControlError.failedToSetMute
    }
}

func getMute() throws -> Bool {
    let deviceID = try getCurrentOutputDeviceID()
    var muted: UInt32 = 0
    var size = UInt32(MemoryLayout<UInt32>.size)
    var propertyAddress = AudioObjectPropertyAddress(
        mSelector: kAudioDevicePropertyMute,
        mScope: kAudioDevicePropertyScopeOutput,
        mElement: 0
    )
    let result = AudioObjectGetPropertyData(
        deviceID,
        &propertyAddress,
        0,
        nil,
        &size,
        &muted
    )
    if result != noErr {
        throw VolumeControlError.failedToGetMute
    }
    return muted != 0
}

func toggleMute() throws -> Bool {
    let isMuted = try getMute()
    try setMute(!isMuted)
    return !isMuted
}

enum VolumeControlError: Error {
    case failedToGetDevice
    case failedToGetVolume
    case failedToSetVolume
    case failedToGetMute
    case failedToSetMute
}

// Call main function
main() 