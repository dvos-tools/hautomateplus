import { exec } from 'child_process';
import { LocalControlEventData } from '../types/homeassistant';

export class AppleScriptExecutor {
  static async executeLockCommand(eventData: LocalControlEventData): Promise<void> {
    const { message = 'No message', action = 'No action' } = eventData;
    
    const appleScript = `
      tell application "System Events"
        display notification "${message}" with title "Local Control" subtitle "${action}"
      end tell
      tell application "System Events" to keystroke "q" using {command down, control down}
    `;
    
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
        if (error) {
          console.error("Error running AppleScript:", error);
          reject(error);
          return;
        }
        if (stderr) {
          console.error("AppleScript stderr:", stderr);
          reject(new Error(stderr));
          return;
        }
        console.log("AppleScript executed successfully");
        resolve();
      });
    });
  }
} 