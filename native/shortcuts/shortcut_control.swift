import Foundation
import AppKit // For NSWorkspace and URL handling

// Main function
func main() {
    let args = CommandLine.arguments
    guard args.count > 1 else {
        print("Usage: shortcut_control <shortcut_name> [parameter]")
        print("Example: shortcut_control MyShortcut 'Hello World'")
        exit(1)
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

enum ShortcutControlError: Error {
    case failedToEncodeParameter
    case failedToCreateURL
    case failedToOpenURL
}

func triggerShortcut(shortcutName: String, parameter: String) throws {
    // 1. Encode the parameter
    guard let encodedParameter = parameter.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else {
        throw ShortcutControlError.failedToEncodeParameter
    }

    // 2. Construct the URL
    let urlString: String
    if parameter.isEmpty {
        urlString = "shortcuts://run-shortcut?name=\(shortcutName)"
    } else {
        urlString = "shortcuts://run-shortcut?name=\(shortcutName)&input=\(encodedParameter)"
    }

    guard let url = URL(string: urlString) else {
        throw ShortcutControlError.failedToCreateURL
    }

    // 3. Open the URL
    let success = NSWorkspace.shared.open(url)
    if !success {
        throw ShortcutControlError.failedToOpenURL
    }
}

// Run the main function if this file is executed directly
if CommandLine.arguments.count > 0 {
    main()
}