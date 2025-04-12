import WebSocket from "ws";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { exec } from "child_process";

// Load environment variables
dotenv.config();

interface HAMessage {
  type: string;
  id?: number;
  event?: {
    event_type: string;
    data: any;
    origin: string;
    time_fired: string;
    context: {
      id: string;
      parent_id: null | string;
      user_id: null | string;
    };
  };
}

class HomeAssistantClient extends EventEmitter {
  private ws: WebSocket;
  private msgId: number = 1;
  private authenticated: boolean = false;

  constructor() {
    super();
    const url = process.env.HA_URL;
    if (!url) {
      throw new Error("Home Assistant URL not configured in .env file");
    }
    this.ws = new WebSocket(url);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.ws.on("open", () => {
      console.log("Connected to Home Assistant");
      this.authenticate();
    });

    this.ws.on("message", (data: Buffer) => {
      const message: HAMessage = JSON.parse(data.toString());
      this.handleMessage(message);
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.ws.on("close", () => {
      console.log("Disconnected from Home Assistant");
    });
  }

  private authenticate() {
    const authMessage = {
      type: "auth",
      access_token: process.env.HA_ACCESS_TOKEN,
    };
    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(message: HAMessage) {
    switch (message.type) {
      case "auth_required":
        console.log("Authentication required");
        break;
      case "auth_ok":
        console.log("Authentication successful");
        this.authenticated = true;
        this.subscribeToLocalControlEvents();
        break;
      case "auth_invalid":
        console.error("Authentication failed");
        this.ws.close();
        break;
      case "event":
        if (message.event && message.event.event_type === "local-control") {
          console.log("Local control event received:", {
            data: message.event.data,
            time: message.event.time_fired,
          });
          this.emit("local_control_event", message.event);
        }
        break;
      default:
        // Only log non-event messages
        if (message.type !== "event") {
          console.log("Received message:", message);
        }
    }
  }

  private subscribeToLocalControlEvents() {
    const subscribeMessage = {
      id: this.msgId++,
      type: "subscribe_events",
      event_type: "local-control",
    };
    this.ws.send(JSON.stringify(subscribeMessage));
    console.log("Subscribed to local-control events");
  }

  public close() {
    this.ws.close();
  }
}

// Create and start the client
const client = new HomeAssistantClient();

// Example event listener for local-control events
client.on("local_control_event", (event) => {
  console.log("Local control event:", {
    data: event.data,
    time: event.time_fired,
  });

  // Format the event data for display
  const eventData = event.data || {};
  const message = eventData.message || "No message";
  const action = eventData.action || "No action";

  // Only run AppleScript if action is "lock"
  if (action === "lock") {
    // Run AppleScript to show notification and lock screen
    const appleScript = `
      tell application "System Events"
        display notification "${message}" with title "Local Control" subtitle "${action}"
      end tell
      tell application "System Events" to keystroke "q" using {command down, control down}
    `;
    
    exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error running AppleScript:", error);
        return;
      }
      if (stderr) {
        console.error("AppleScript stderr:", stderr);
        return;
      }
      console.log("AppleScript executed successfully");
    });
  }
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down...");
  client.close();
  process.exit(0);
});
