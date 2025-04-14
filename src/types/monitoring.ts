export interface ConnectionStats {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalReconnects: number;
  lastConnectionTime: Date | null;
  lastDisconnectionTime: Date | null;
  currentLatency: number | null;
  averageLatency: number;
  connectionUptime: number;
  totalUptime: number;
  lastError: string | null;
  errorCount: number;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  lastHeartbeat: Date | null;
  missedHeartbeats: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number | null;
  packetLoss: number;
} 