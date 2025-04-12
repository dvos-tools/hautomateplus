import { exec } from 'child_process';
import { promisify } from 'util';
import { PowerState, ConnectionStats, ConnectionHealth } from '../types/monitoring';

const execAsync = promisify(exec);

export class MonitoringService {
  private stats: ConnectionStats = {
    totalConnections: 0,
    successfulConnections: 0,
    failedConnections: 0,
    totalReconnects: 0,
    lastConnectionTime: null,
    lastDisconnectionTime: null,
    currentLatency: null,
    averageLatency: 0,
    connectionUptime: 0,
    totalUptime: 0,
    lastError: null,
    errorCount: 0
  };

  private health: ConnectionHealth = {
    isHealthy: true,
    lastHeartbeat: null,
    missedHeartbeats: 0,
    connectionQuality: 'excellent',
    latency: null,
    packetLoss: 0
  };

  private powerState: PowerState = {
    isOnBattery: false,
    batteryLevel: null,
    isCharging: false,
    isLowPowerMode: false,
    systemPowerState: 'unknown'
  };

  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly MAX_MISSED_HEARTBEATS = 3;

  constructor() {
    this.startMonitoring();
  }

  private async startMonitoring(): Promise<void> {
    // Start power monitoring
    await this.updatePowerState();
    setInterval(() => this.updatePowerState(), 60000); // Update every minute

    // Start connection monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, this.HEARTBEAT_INTERVAL);
  }

  private async updatePowerState(): Promise<void> {
    try {
      // Get battery info
      const { stdout: batteryInfo } = await execAsync('pmset -g batt');
      const batteryMatch = batteryInfo.match(/(\d+)%; (charging|discharging|AC attached)/);
      
      if (batteryMatch) {
        this.powerState.batteryLevel = parseInt(batteryMatch[1]);
        this.powerState.isCharging = batteryMatch[2] === 'charging';
        this.powerState.isOnBattery = batteryMatch[2] === 'discharging';
      }

      // Get power mode
      const { stdout: powerMode } = await execAsync('pmset -g');
      this.powerState.isLowPowerMode = powerMode.includes('lowpowermode 1');
      
      // Determine system power state
      if (this.powerState.isLowPowerMode) {
        this.powerState.systemPowerState = 'low-power';
      } else if (!this.powerState.isOnBattery) {
        this.powerState.systemPowerState = 'normal';
      } else {
        this.powerState.systemPowerState = 'normal';
      }
    } catch (error) {
      console.error('Error updating power state:', error);
    }
  }

  private checkConnectionHealth(): void {
    const now = new Date();
    if (this.health.lastHeartbeat) {
      const timeSinceLastHeartbeat = now.getTime() - this.health.lastHeartbeat.getTime();
      if (timeSinceLastHeartbeat > this.HEARTBEAT_INTERVAL * 1.5) {
        this.health.missedHeartbeats++;
        if (this.health.missedHeartbeats >= this.MAX_MISSED_HEARTBEATS) {
          this.health.isHealthy = false;
          this.health.connectionQuality = 'poor';
        }
      }
    }
  }

  public recordConnection(success: boolean, error?: string): void {
    this.stats.totalConnections++;
    if (success) {
      this.stats.successfulConnections++;
      this.stats.lastConnectionTime = new Date();
      this.health.isHealthy = true;
      this.health.missedHeartbeats = 0;
    } else {
      this.stats.failedConnections++;
      this.stats.lastError = error || 'Unknown error';
      this.stats.errorCount++;
    }
  }

  public recordDisconnection(): void {
    this.stats.lastDisconnectionTime = new Date();
    if (this.stats.lastConnectionTime) {
      const uptime = this.stats.lastDisconnectionTime.getTime() - this.stats.lastConnectionTime.getTime();
      this.stats.connectionUptime += uptime;
      this.stats.totalUptime += uptime;
    }
  }

  public recordReconnect(): void {
    this.stats.totalReconnects++;
  }

  public recordHeartbeat(latency: number): void {
    this.health.lastHeartbeat = new Date();
    this.health.missedHeartbeats = 0;
    this.stats.currentLatency = latency;
    
    // Update average latency
    this.stats.averageLatency = (this.stats.averageLatency * 0.9) + (latency * 0.1);
    
    // Update connection quality based on latency
    if (latency < 100) {
      this.health.connectionQuality = 'excellent';
    } else if (latency < 300) {
      this.health.connectionQuality = 'good';
    } else if (latency < 1000) {
      this.health.connectionQuality = 'fair';
    } else {
      this.health.connectionQuality = 'poor';
    }
  }

  public getStats(): ConnectionStats {
    return { ...this.stats };
  }

  public getHealth(): ConnectionHealth {
    return { ...this.health };
  }

  public getPowerState(): PowerState {
    return { ...this.powerState };
  }

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
} 