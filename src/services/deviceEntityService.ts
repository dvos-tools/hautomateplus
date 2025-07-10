import { DeviceInfoService } from './deviceInfoService';

export interface DeviceEntities {
  connectionStatus: string;
  deviceName: string;
}

export class DeviceEntityService {
  private baseUrl: string;
  private token: string;
  private deviceName: string = '';
  private entities: DeviceEntities | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = parseInt(process.env.DEVICE_ENTITY_UPDATE_INTERVAL || '30000'); // Configurable interval
  private lastKnownStates: Record<string, { state: string; attributes: Record<string, any> }> = {};

  constructor() {
    this.baseUrl = process.env.HA_URL?.replace('ws://', 'http://').replace('wss://', 'https://').replace('/api/websocket', '') || '';
    this.token = process.env.HA_ACCESS_TOKEN || process.env.HA_TOKEN || '';
    if (!this.baseUrl || !this.token) {
      throw new Error('HA_URL and HA_ACCESS_TOKEN (or HA_TOKEN) must be set in environment');
    }
  }

  async initialize(): Promise<void> {
    this.deviceName = 'hautomateplus';
    this.entities = {
      connectionStatus: `binary_sensor.${this.deviceName}_connection`,
      deviceName: `sensor.${this.deviceName}_device_name`
    };
    
    console.log('Device entities initialized:', this.entities);
    console.log('Device will be created automatically when entities are updated with device information');
  }

  private async updateEntity(entityId: string, state: string, attributes: Record<string, any> = {}) {
    // Check if the state or key attributes have changed from the last known value
    const lastKnown = this.lastKnownStates[entityId];
    const stateChanged = !lastKnown || lastKnown.state !== state;
    const attributesChanged = !lastKnown || JSON.stringify(lastKnown.attributes) !== JSON.stringify(attributes);
    
    if (!stateChanged && !attributesChanged) {
      console.log(`Entity state and attributes unchanged, skipping update: ${entityId} = ${state}`);
      return;
    }

    const url = `${this.baseUrl}/api/states/${entityId}`;
    
    // Add device information to group entities under a single device
    // Home Assistant will automatically create a device when entities share the same device_id
    const deviceAttributes = {
      ...attributes,
      device_id: 'hautomateplus_device',
      device_name: 'hautomateplus',
      manufacturer: 'hautomateplus',
      model: 'Local Automation Extension',
      sw_version: '1.0.0',
      identifiers: [['hautomateplus', 'hautomateplus']]
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, attributes: deviceAttributes })
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to update entity ${entityId}:`, res.status, text);
    } else {
      console.log(`Entity state updated: ${entityId} = ${state}`);
      // Update the last known state and attributes after successful update
      this.lastKnownStates[entityId] = { state, attributes };
    }
  }

  async createOrUpdateEntities(isConnected: boolean = true): Promise<void> {
    if (!this.entities) throw new Error('Device entities not initialized.');
    const deviceInfo = await DeviceInfoService.getDeviceInfo(isConnected);

    // Connection status
    await this.updateEntity(this.entities.connectionStatus, isConnected ? 'on' : 'off', {
      friendly_name: `${this.deviceName} Connection Status`,
      device_class: 'connectivity',
      icon: 'mdi:connection',
      unique_id: 'hautomateplus_connection_status',
      last_update: deviceInfo.lastUpdate
    });
    // Device name
    await this.updateEntity(this.entities.deviceName, deviceInfo.deviceName, {
      friendly_name: `${this.deviceName} Device Name`,
      icon: 'mdi:desktop-mac',
      unique_id: 'hautomateplus_device_name',
      last_update: deviceInfo.lastUpdate
    });
  }

  startPeriodicUpdates(interval: number = this.UPDATE_INTERVAL): void {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      this.createOrUpdateEntities(true).catch(e => console.error('Periodic update error:', e));
    }, interval);
    console.log(`Started periodic device state updates every ${interval / 1000} seconds`);
  }

  stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Stopped periodic device state updates');
    }
  }

  async updateConnectionStatus(isConnected: boolean): Promise<void> {
    if (!this.entities) return;
    await this.updateEntity(this.entities.connectionStatus, isConnected ? 'on' : 'off', {
      friendly_name: `${this.deviceName} Connection Status`,
      device_class: 'connectivity',
      icon: 'mdi:connection',
      unique_id: 'hautomateplus_connection_status',
      last_update: new Date().toISOString()
    });
  }

  getEntityIds(): DeviceEntities | null {
    return this.entities;
  }

  clearStateCache(): void {
    this.lastKnownStates = {};
    console.log('State cache cleared - next updates will be forced');
  }

  cleanup(): void {
    this.stopPeriodicUpdates();
  }
} 
