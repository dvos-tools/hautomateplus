import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { HAMessage, HAEvent, AuthMessage, SubscribeMessage } from '../types/homeassistant';
import { MonitoringService } from '../services/MonitoringService';
import { ConnectionHealth, ConnectionStats } from '../types/monitoring';

export class HomeAssistantWebSocket extends EventEmitter {
  private ws: WebSocket;
  private msgId: number = 1;
  private authenticated: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly baseReconnectDelay: number = 1000;
  private readonly maxReconnectDelay: number = 30000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private monitoringService: MonitoringService;

  constructor(private readonly url: string, private readonly accessToken: string) {
    super();
    this.monitoringService = new MonitoringService();
    this.ws = this.createWebSocket();
    this.setupEventListeners();
    this.setupSystemEventListeners();
  }

  private createWebSocket(): WebSocket {
    return new WebSocket(this.url);
  }

  private setupEventListeners(): void {
    this.ws.on('open', () => {
      console.log('Connected to Home Assistant');
      this.reconnectAttempts = 0;
      this.monitoringService.recordConnection(true);
      this.authenticate();
      this.startHeartbeat();
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const message: HAMessage = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.monitoringService.recordConnection(false, 'Message parsing error');
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.monitoringService.recordConnection(false, error.message);
      this.handleReconnect();
    });

    this.ws.on('close', () => {
      console.log('Disconnected from Home Assistant');
      this.monitoringService.recordDisconnection();
      this.stopHeartbeat();
      this.handleReconnect();
    });
  }

  private setupSystemEventListeners(): void {
    // Handle system sleep/wake events
    process.on('SIGUSR1', () => {
      console.log('System wake detected, attempting to reconnect...');
      this.handleReconnect();
    });

    // Handle network interface changes
    if (process.platform === 'darwin') {
      process.on('SIGUSR2', () => {
        console.log('Network change detected, attempting to reconnect...');
        this.handleReconnect();
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      const startTime = Date.now();
      const heartbeatMessage = {
        id: this.msgId++,
        type: 'ping'
      };
      
      this.ws.send(JSON.stringify(heartbeatMessage), (error) => {
        if (error) {
          console.error('Error sending heartbeat:', error);
          this.monitoringService.recordConnection(false, 'Heartbeat error');
          return;
        }
        
        const latency = Date.now() - startTime;
        this.monitoringService.recordHeartbeat(latency);
      });
    }
  }

  private calculateReconnectDelay(): number {
    const exponentialDelay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    const jitter = exponentialDelay * 0.2;
    return exponentialDelay + (Math.random() * jitter * 2 - jitter);
  }

  private handleReconnect(): void {
    if (this.isShuttingDown) {
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
    }

    this.reconnectAttempts++;
    this.monitoringService.recordReconnect();
    
    const delay = this.calculateReconnectDelay();
    console.log(`Attempting to reconnect in ${Math.round(delay/1000)} seconds (attempt ${this.reconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      try {
        this.ws = this.createWebSocket();
        this.setupEventListeners();
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.handleReconnect();
      }
    }, delay);
  }

  private authenticate(): void {
    const authMessage: AuthMessage = {
      type: 'auth',
      access_token: this.accessToken,
    };
    this.sendMessage(authMessage);
  }

  private subscribeToLocalControlEvents(): void {
    const subscribeMessage: SubscribeMessage = {
      id: this.msgId++,
      type: 'subscribe_events',
      event_type: 'local-control',
    };
    this.sendMessage(subscribeMessage);
    console.log('Subscribed to local-control events');
  }

  private sendMessage(message: any): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
      this.handleReconnect();
    }
  }

  private handleMessage(message: HAMessage): void {
    switch (message.type) {
      case 'auth_required':
        console.log('Authentication required');
        break;
      case 'auth_ok':
        console.log('Authentication successful');
        this.authenticated = true;
        this.reconnectAttempts = 0;
        this.subscribeToLocalControlEvents();
        break;
      case 'auth_invalid':
        console.error('Authentication failed - stopping reconnection attempts');
        this.monitoringService.recordConnection(false, 'Authentication failed');
        this.emit('error', new Error('Authentication failed'));
        this.isShuttingDown = true;
        this.ws.close();
        break;
      case 'pong':
        // Handle pong response to our heartbeat
        break;
      case 'event':
        if (message.event?.event_type === 'local-control') {
          this.handleLocalControlEvent(message.event);
        }
        break;
      default:
        if (message.type !== 'event') {
          console.log('Received message:', message);
        }
    }
  }

  private handleLocalControlEvent(event: HAEvent): void {
    console.log('Local control event received:', {
      data: event.data,
      time: event.time_fired,
    });
    this.emit('local_control_event', event);
  }

  public getConnectionHealth(): ConnectionHealth {
    return this.monitoringService.getHealth();
  }

  public getConnectionStats(): ConnectionStats {
    return this.monitoringService.getStats();
  }

  public close(): void {
    this.isShuttingDown = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.ws.close();
    this.monitoringService.stop();
  }
} 