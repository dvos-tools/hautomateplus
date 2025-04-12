import { HomeAssistantWebSocket } from './HomeAssistantWebSocket';
import { EventEmitter } from 'events';
import { HAEvent } from '../types/homeassistant';
import { ConnectionHealth } from '../types/monitoring';

export class HomeAssistantClient extends EventEmitter {
  private ws: HomeAssistantWebSocket;

  constructor(url: string, accessToken: string) {
    super();
    this.ws = new HomeAssistantWebSocket(url, accessToken);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Forward all events from the WebSocket client
    this.ws.on('local_control_event', (event: HAEvent) => {
      this.emit('local_control_event', event);
    });

    this.ws.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

  public getConnectionHealth(): ConnectionHealth {
    return this.ws.getConnectionHealth();
  }

  public close(): void {
    this.ws.close();
  }
} 