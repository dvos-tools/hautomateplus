import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

export interface NotificationResponse {
  notificationId: string;
  timestamp: number;
  userText: string;
}

export interface InteractiveNotificationOptions {
  title: string;
  message: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  timeout?: number; // Timeout in milliseconds
}

/**
 * Enhanced Notification Service with interactive capabilities
 * 
 * This service provides both basic notifications and interactive notifications
 * with text input capabilities using native Swift implementation.
 * 
 * Note: The Swift binary must be built before using this class.
 * Run: npm run build:native
 */
export class NotificationService extends EventEmitter {
  private static binaryPath = join(__dirname, '../../native/notifications/notifications_control');
  private static instance: NotificationService;
  private responseListener: any;

  private constructor() {
    super();
    this.setupResponseListener();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Set up a listener to capture notification responses from the Swift binary
   */
  private setupResponseListener() {
    // This will be used to capture responses from interactive notifications
    // The Swift binary outputs responses in a specific format that we can parse
  }

  /**
   * Check if the native binary is available
   * @returns A promise that resolves to true if the binary exists and is executable
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync(`test -x "${this.binaryPath}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request notification permissions
   * @returns A promise that resolves when permission is requested
   */
  static async requestPermission(): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} request-permission`);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw new Error(`Failed to request permission: ${error}`);
    }
  }

  /**
   * Check current notification permission status
   * @returns A promise that resolves with the permission status
   */
  static async checkPermission(): Promise<string> {
    try {
      const { stdout } = await execAsync(`${this.binaryPath} check-permission`);
      return stdout.trim();
    } catch (error) {
      console.error('Error checking notification permission:', error);
      throw new Error(`Failed to check permission: ${error}`);
    }
  }

  /**
   * Display a basic system notification
   * @param message The message to display
   * @param title Optional title for the notification
   * @param subtitle Optional subtitle for the notification
   * @param category Optional category for the notification
   * @returns A promise that resolves when the notification is displayed
   */
  static async displayNotification(
    message: string, 
    title: string = 'System Control',
    subtitle?: string,
    category?: string
  ): Promise<void> {
    try {
      let command = `${this.binaryPath} show "${title}" "${message}"`;
      
      if (subtitle) {
        command += ` "${subtitle}"`;
      }
      
      if (category) {
        command += ` "${category}"`;
      }
      
      await execAsync(command);
      console.log('Notification displayed successfully');
    } catch (error) {
      console.error('Error displaying notification:', error);
      throw new Error(`Failed to display notification: ${error}`);
    }
  }

  /**
   * Display an interactive notification with text input
   * @param options Configuration options for the interactive notification
   * @returns A promise that resolves with the user's response or rejects on timeout/cancel
   */
  static async displayInteractiveNotification(options: InteractiveNotificationOptions): Promise<NotificationResponse> {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 30000; // Default 30 seconds
      let command = `${this.binaryPath} show-interactive "${options.title}" "${options.message}"`;
      
      if (options.subtitle) {
        command += ` "${options.subtitle}"`;
      }
      
      if (options.placeholder) {
        command += ` "${options.placeholder}"`;
      }
      
      if (options.buttonText) {
        command += ` "${options.buttonText}"`;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Notification timeout - no response received'));
      }, timeout);

      // Execute the command and listen for response
      const child = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        
        // Check for notification response
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.startsWith('NOTIFICATION_RESPONSE:')) {
            clearTimeout(timeoutId);
            const parts = line.split(':');
            if (parts.length >= 4) {
              const response: NotificationResponse = {
                notificationId: parts[1],
                timestamp: parseFloat(parts[2]),
                userText: parts.slice(3).join(':') // Rejoin in case user text contains colons
              };
              child.kill();
              resolve(response);
              return;
            }
          } else if (line.includes('NOTIFICATION_CANCELLED')) {
            clearTimeout(timeoutId);
            child.kill();
            reject(new Error('Notification cancelled by user'));
            return;
          }
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code !== 0) {
          reject(new Error(`Notification process failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to execute notification command: ${error.message}`));
      });
    });
  }

  /**
   * List all registered notification categories
   * @returns A promise that resolves with the list of categories
   */
  static async listCategories(): Promise<void> {
    try {
      const { stdout } = await execAsync(`${this.binaryPath} list-categories`);
      console.log(stdout);
    } catch (error) {
      console.error('Error listing notification categories:', error);
      throw new Error(`Failed to list categories: ${error}`);
    }
  }

  /**
   * Clear all delivered notifications
   * @returns A promise that resolves when all notifications are cleared
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      await execAsync(`${this.binaryPath} clear-all`);
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw new Error(`Failed to clear notifications: ${error}`);
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use displayNotification instead
   */
  static async showNotification(
    message: string, 
    title: string = 'System Control',
    subtitle?: string
  ): Promise<void> {
    return this.displayNotification(message, title, subtitle);
  }
} 