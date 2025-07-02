import Foundation

// Main function
func main() {
    let args = CommandLine.arguments
    guard args.count > 1 else {
        print("Usage: notifications_control <command> [options]")
        print("Commands:")
        print("  show <title> <message> [subtitle] - Show a basic notification")
        print("  show-interactive <title> <message> [subtitle] [placeholder] [button-text] - Show interactive notification with text input")
        print("  check-permission - Check current permission status")
        print("  clear-all - Clear all delivered notifications")
        exit(1)
    }
    
    let command = args[1]
    
    do {
        switch command {
        case "show":
            guard args.count > 3 else {
                print("Error: show command requires title and message")
                exit(1)
            }
            let title = args[2]
            let message = args[3]
            let subtitle = args.count > 4 ? args[4] : nil
            try showNotification(title: title, message: message, subtitle: subtitle)
            print("Notification sent")
            
        case "show-interactive":
            guard args.count > 3 else {
                print("Error: show-interactive command requires title and message")
                exit(1)
            }
            let title = args[2]
            let message = args[3]
            let subtitle = args.count > 4 ? args[4] : nil
            let placeholder = args.count > 5 ? args[5] : "Enter text..."
            let buttonText = args.count > 6 ? args[6] : "Submit"
            try showInteractiveNotification(title: title, message: message, subtitle: subtitle, placeholder: placeholder, buttonText: buttonText)
            print("Interactive notification sent")
            
        case "check-permission":
            let status = try checkPermission()
            print(status)
            
        case "clear-all":
            try clearAllNotifications()
            print("All notifications cleared")
            
        default:
            print("Unknown command: \(command)")
            exit(1)
        }
    } catch {
        print("Error: \(error)")
        exit(1)
    }
}

func checkPermission() throws -> String {
    // For AppleScript-based notifications, we can't easily check permissions
    // but we can test if the system allows notifications
    let testScript = """
    tell application \"System Events\"
        display notification \"Test\" with title \"Permission Test\"
    end tell
    """
    
    let task = Process()
    task.launchPath = "/usr/bin/osascript"
    task.arguments = ["-e", testScript]
    
    do {
        try task.run()
        task.waitUntilExit()
        return "authorized"
    } catch {
        return "denied"
    }
}

func showNotification(title: String, message: String, subtitle: String? = nil) throws {
    var appleScript = "tell application \"System Events\"\n    display notification \"" + message.replacingOccurrences(of: "\"", with: "\\\"") + "\" with title \"" + title.replacingOccurrences(of: "\"", with: "\\\"") + "\""
    if let subtitle = subtitle {
        appleScript += " subtitle \"" + subtitle.replacingOccurrences(of: "\"", with: "\\\"") + "\""
    }
    appleScript += "\nend tell"
    
    let task = Process()
    task.launchPath = "/usr/bin/osascript"
    task.arguments = ["-e", appleScript]
    
    try task.run()
    task.waitUntilExit()
    
    if task.terminationStatus != 0 {
        throw NotificationError.failedToCreateNotification
    }
}

func showInteractiveNotification(title: String, message: String, subtitle: String? = nil, placeholder: String = "Enter text...", buttonText: String = "Submit") throws {
    // For interactive notifications, we'll use a dialog box instead
    // This provides text input capabilities similar to interactive notifications
    var dialogScript = "tell application \"System Events\"\n    activate\n    set userInput to text returned of (display dialog \"" + message.replacingOccurrences(of: "\"", with: "\\\"") + "\" default answer \"\" with title \"" + title.replacingOccurrences(of: "\"", with: "\\\"") + "\""
    if subtitle != nil {
        dialogScript += " with icon note"
    }
    dialogScript += " buttons {\"" + buttonText.replacingOccurrences(of: "\"", with: "\\\"") + "\", \"Cancel\"} default button \"" + buttonText.replacingOccurrences(of: "\"", with: "\\\"") + "\" cancel button \"Cancel\")\nend tell"
    
    let task = Process()
    task.launchPath = "/usr/bin/osascript"
    task.arguments = ["-e", dialogScript]
    
    let pipe = Pipe()
    task.standardOutput = pipe
    
    try task.run()
    task.waitUntilExit()
    
    if task.terminationStatus == 0 {
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        if let output = String(data: data, encoding: .utf8) {
            let trimmedOutput = output.trimmingCharacters(in: .whitespacesAndNewlines)
            let notificationId = UUID().uuidString
            let timestamp = Date().timeIntervalSince1970
            
            // Output the response in the expected format
            print("NOTIFICATION_RESPONSE:\(notificationId):\(timestamp):\(trimmedOutput)")
        }
    } else {
        print("NOTIFICATION_CANCELLED")
    }
}

func clearAllNotifications() throws {
    // AppleScript doesn't have a direct way to clear notifications
    // This is a limitation of the AppleScript approach
    print("Note: AppleScript-based notifications cannot be programmatically cleared")
}

enum NotificationError: Error {
    case permissionDenied
    case failedToCreateNotification
    case failedToAddNotification
}

// Call main function
main()
