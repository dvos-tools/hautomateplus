import Foundation

// Main function
func main() {
    let args = CommandLine.arguments
    guard args.count > 1 else {
        printHelp()
        exit(1)
    }
    
    // Check for help flags
    if args[1] == "--help" || args[1] == "-h" {
        printHelp()
        exit(0)
    }
    
    let shortcutName = args[1]
    let parameter = args.count > 2 ? args[2] : ""
    
    do {
        try triggerShortcut(shortcutName: shortcutName, parameter: parameter)
        print("Shortcut '\(shortcutName)' triggered successfully")
    } catch {
        print("Error: \(error)")
        exit(1)
    }
}

func printHelp() {
    print("Usage: shortcut_control <shortcut_name> [parameter]")
    print("Example: shortcut_control MyShortcut 'Hello World'")
    print("")
    print("This tool triggers macOS Shortcuts using AppleScript with the 'Shortcuts Events' application.")
    print("It's more reliable than URL schemes and doesn't cause focus issues.")
}

enum ShortcutControlError: Error {
    case failedToExecuteScript
    case scriptExecutionFailed
}

func triggerShortcut(shortcutName: String, parameter: String) throws {
    // Escape the shortcut name and parameter for AppleScript
    let escapedShortcutName = shortcutName.replacingOccurrences(of: "\"", with: "\\\"")
    let escapedParameter = parameter.replacingOccurrences(of: "\"", with: "\\\"")
    
    // Construct the AppleScript command
    let script: String
    if parameter.isEmpty {
        script = """
        tell application "Shortcuts Events"
            run the shortcut named "\(escapedShortcutName)"
        end tell
        """
    } else {
        script = """
        tell application "Shortcuts Events"
            run the shortcut named "\(escapedShortcutName)" with input "\(escapedParameter)"
        end tell
        """
    }
    
    // Execute the AppleScript using osascript
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
    process.arguments = ["-e", script]
    
    let pipe = Pipe()
    process.standardOutput = pipe
    process.standardError = pipe
    
    do {
        try process.run()
        process.waitUntilExit()
        
        if process.terminationStatus != 0 {
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            if let errorOutput = String(data: data, encoding: .utf8) {
                print("AppleScript error: \(errorOutput)")
            }
            throw ShortcutControlError.scriptExecutionFailed
        }
    } catch {
        throw ShortcutControlError.failedToExecuteScript
    }
}

// Run the main function if this file is executed directly
if CommandLine.arguments.count > 0 {
    main()
}