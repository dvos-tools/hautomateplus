import Foundation
import UserNotifications
import AppKit

// Main function
func main() {
    // Set up the application properly for GUI notifications
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory) // This allows the app to show notifications without dock icon
    
    let args = CommandLine.arguments
    guard args.count > 1 else {
        print("Usage: notifications_control <command> [options]")
        print("Commands:")
        print("  show <title> <message> [subtitle] - Show a basic notification")
        print("  show-interactive <title> <message> [subtitle] [placeholder] [button-text] - Show interactive notification with text input")
        print("  request-permission - Request notification permissions")
        print("  check-permission - Check current permission status")
        print("  list-categories - List registered notification categories")
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
            
        case "request-permission":
            try requestPermission()
            print("Permission request sent")
            
        case "check-permission":
            let status = try checkPermission()
            print(status)
            
        case "list-categories":
            try listCategories()
            
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
    
    // Run the app event loop briefly to handle notifications
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
        app.terminate(nil)
    }
    
    app.run()
}

func requestPermission() throws {
    let center = UNUserNotificationCenter.current()
    let semaphore = DispatchSemaphore(value: 0)
    var granted = false
    
    center.requestAuthorization(options: [.alert, .sound, .badge]) { success, error in
        granted = success
        if let error = error {
            print("Permission request error: \(error)")
        }
        semaphore.signal()
    }
    
    semaphore.wait()
    
    if !granted {
        throw NotificationError.permissionDenied
    }
}

func checkPermission() throws -> String {
    let center = UNUserNotificationCenter.current()
    let semaphore = DispatchSemaphore(value: 0)
    var status: UNAuthorizationStatus = .notDetermined
    
    center.getNotificationSettings { settings in
        status = settings.authorizationStatus
        semaphore.signal()
    }
    
    semaphore.wait()
    
    switch status {
    case .authorized:
        return "authorized"
    case .denied:
        return "denied"
    case .notDetermined:
        return "notDetermined"
    case .provisional:
        return "provisional"
    case .ephemeral:
        return "ephemeral"
    @unknown default:
        return "unknown"
    }
}

func showNotification(title: String, message: String, subtitle: String? = nil) throws {
    let center = UNUserNotificationCenter.current()
    
    // Create notification content
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = message
    if let subtitle = subtitle {
        content.subtitle = subtitle
    }
    content.sound = .default
    
    // Create trigger (immediate)
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    
    // Create request
    let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: trigger
    )
    
    // Add to notification center
    center.add(request) { error in
        if let error = error {
            print("Error adding notification: \(error)")
        }
    }
}

func showInteractiveNotification(title: String, message: String, subtitle: String? = nil, placeholder: String = "Enter text...", buttonText: String = "Submit") throws {
    let center = UNUserNotificationCenter.current()
    
    // Create action that will trigger the dialog
    let dialogAction = UNNotificationAction(
        identifier: "OPEN_DIALOG_ACTION",
        title: buttonText,
        options: [.foreground]
    )
    
    // Create cancel action
    let cancelAction = UNNotificationAction(
        identifier: "CANCEL_ACTION",
        title: "Cancel",
        options: []
    )
    
    // Create category with actions
    let category = UNNotificationCategory(
        identifier: "INTERACTIVE_CATEGORY",
        actions: [dialogAction, cancelAction],
        intentIdentifiers: [],
        options: []
    )
    
    // Register the category
    center.setNotificationCategories([category])
    
    // Create notification content
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = message
    if let subtitle = subtitle {
        content.subtitle = subtitle
    }
    content.sound = .default
    content.categoryIdentifier = "INTERACTIVE_CATEGORY"
    
    // Add user info for identification
    content.userInfo = [
        "notification_id": UUID().uuidString,
        "timestamp": Date().timeIntervalSince1970,
        "placeholder": placeholder,
        "button_text": buttonText
    ]
    
    // Create trigger (immediate)
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    
    // Create request
    let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: trigger
    )
    
    // Add to notification center
    center.add(request) { error in
        if let error = error {
            print("Error adding interactive notification: \(error)")
        }
    }
}

func listCategories() throws {
    let center = UNUserNotificationCenter.current()
    let semaphore = DispatchSemaphore(value: 0)
    
    center.getNotificationCategories { categories in
        print("Registered notification categories:")
        for category in categories {
            print("- \(category.identifier)")
            for action in category.actions {
                print("  - \(action.identifier): \(action.title)")
            }
        }
        semaphore.signal()
    }
    
    semaphore.wait()
}

func clearAllNotifications() throws {
    let center = UNUserNotificationCenter.current()
    center.removeAllDeliveredNotifications()
}

enum NotificationError: Error {
    case permissionDenied
    case failedToCreateNotification
    case failedToAddNotification
}

// Set up notification delegate to handle responses
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let identifier = response.actionIdentifier
        
        switch identifier {
        case "OPEN_DIALOG_ACTION":
            // Get user info from notification
            let userInfo = response.notification.request.content.userInfo
            let notificationId = userInfo["notification_id"] as? String ?? "unknown"
            let timestamp = userInfo["timestamp"] as? TimeInterval ?? 0
            let placeholder = userInfo["placeholder"] as? String ?? "Enter text..."
            let buttonText = userInfo["button_text"] as? String ?? "Submit"
            
            // Show native dialog on main thread
            DispatchQueue.main.async {
                self.showInputDialog(
                    title: response.notification.request.content.title,
                    message: response.notification.request.content.body,
                    placeholder: placeholder,
                    buttonText: buttonText,
                    notificationId: notificationId,
                    timestamp: timestamp
                )
            }
            
        case "CANCEL_ACTION":
            print("NOTIFICATION_CANCELLED")
        default:
            break
        }
        
        completionHandler()
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show notification even when app is in foreground
        completionHandler([.alert, .sound, .badge])
    }
    
    private func showInputDialog(title: String, message: String, placeholder: String, buttonText: String, notificationId: String, timestamp: TimeInterval) {
        // Create the alert
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.alertStyle = .informational
        
        // Add text field
        let textField = NSTextField(frame: NSRect(x: 0, y: 0, width: 300, height: 24))
        textField.placeholderString = placeholder
        alert.accessoryView = textField
        
        // Add buttons
        alert.addButton(withTitle: buttonText)
        alert.addButton(withTitle: "Cancel")
        
        // Show the dialog
        let response = alert.runModal()
        
        if response == .alertFirstButtonReturn {
            // User clicked the submit button
            let userText = textField.stringValue
            print("NOTIFICATION_RESPONSE:\(notificationId):\(timestamp):\(userText)")
        } else {
            // User clicked cancel
            print("NOTIFICATION_CANCELLED")
        }
    }
}

// Set up the delegate
let delegate = NotificationDelegate()
UNUserNotificationCenter.current().delegate = delegate

// Call main function
main()
