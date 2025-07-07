import { DeviceInfoService } from './deviceInfoService';
import { ShortcutService } from './shortcutService';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface DeviceEntities {
  connectionStatus: string;
  deviceName: string;
}

export interface CustomEntity {
  name: string;
  shortcutName: string;
  filePath: string;
  entityType?: string;
  unitOfMeasurement?: string;
  deviceClass?: string;
  stateClass?: string;
  entityId?: string;
}

export interface CustomEntityConfig {
  enabled: boolean;
  entities: CustomEntity[];
}

export class DeviceEntityService {
  private baseUrl: string;
  private token: string;
  private deviceName: string = '';
  private entities: DeviceEntities | null = null;
  private customEntities: CustomEntity[] = [];
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

  async initialize(customEntityConfig?: CustomEntityConfig): Promise<void> {
    this.deviceName = 'hautomateplus';
    this.entities = {
      connectionStatus: `binary_sensor.${this.deviceName}_connection`,
      deviceName: `sensor.${this.deviceName}_device_name`
    };
    
    // Initialize custom entities if provided
    if (customEntityConfig?.enabled && customEntityConfig.entities) {
      this.customEntities = customEntityConfig.entities.map(entity => ({
        ...entity,
        entityId: entity.entityId || `${entity.entityType || 'sensor'}.${this.deviceName}_${entity.name.toLowerCase().replace(/\s+/g, '_')}`
      }));
      console.log(`Initialized ${this.customEntities.length} custom entities`);
    }
    
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

  private async readShortcutOutput(filePath: string): Promise<string> {
    try {
      // Expand ~ to home directory
      const expandedPath = filePath.startsWith('~') 
        ? path.join(os.homedir(), filePath.slice(1))
        : filePath;
      
      if (!fs.existsSync(expandedPath)) {
        console.log(`Output file does not exist: ${expandedPath}`);
        return 'unknown';
      }
      
      const content = fs.readFileSync(expandedPath, 'utf8').trim();
      return content || 'unknown';
    } catch (error) {
      console.error(`Error reading shortcut output file ${filePath}:`, error);
      return 'error';
    }
  }

  private async registerEntityInRegistry(entity: CustomEntity): Promise<void> {
    const uniqueId = `hautomateplus_${entity.name.toLowerCase().replace(/\s+/g, '_')}`;
    const url = `${this.baseUrl}/api/config/entity_registry/create`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_id: entity.entityId!,
          name: `${this.deviceName} ${entity.name}`,
          platform: 'hautomateplus',
          unique_id: uniqueId,
          device_id: 'hautomateplus_device',
          ...(entity.deviceClass && { device_class: entity.deviceClass }),
          ...(entity.unitOfMeasurement && { unit_of_measurement: entity.unitOfMeasurement }),
          ...(entity.stateClass && { state_class: entity.stateClass })
        })
      });
      
      if (response.ok) {
        console.log(`Registered entity in registry: ${entity.entityId!}`);
      } else {
        // Entity might already exist, which is fine
        console.log(`Entity registry registration response: ${response.status} for ${entity.entityId!}`);
      }
    } catch (error) {
      console.log(`Entity registry registration failed for ${entity.entityId!}:`, error);
    }
  }

  private async updateCustomEntities(): Promise<void> {
    for (const entity of this.customEntities) {
      try {
        // Register entity in registry first (if not already registered)
        await this.registerEntityInRegistry(entity);
        
        // Run the shortcut
        await ShortcutService.triggerShortcut(entity.shortcutName);
        
        // Read the output file
        const value = await this.readShortcutOutput(entity.filePath);
        
        // Update the entity
        await this.updateEntity(entity.entityId!, value, {
          friendly_name: `${this.deviceName} ${entity.name}`,
          icon: 'mdi:script-text',
          unique_id: `hautomateplus_${entity.name.toLowerCase().replace(/\s+/g, '_')}`,
          last_update: new Date().toISOString(),
          ...(entity.unitOfMeasurement && { unit_of_measurement: entity.unitOfMeasurement }),
          ...(entity.deviceClass && { device_class: entity.deviceClass }),
          ...(entity.stateClass && { state_class: entity.stateClass })
        });
      } catch (error) {
        console.error(`Failed to update custom entity ${entity.name}:`, error);
        // Update with error state
        await this.updateEntity(entity.entityId!, 'error', {
          friendly_name: `${this.deviceName} ${entity.name}`,
          icon: 'mdi:script-text',
          unique_id: `hautomateplus_${entity.name.toLowerCase().replace(/\s+/g, '_')}`,
          last_update: new Date().toISOString(),
          ...(entity.unitOfMeasurement && { unit_of_measurement: entity.unitOfMeasurement }),
          ...(entity.deviceClass && { device_class: entity.deviceClass }),
          ...(entity.stateClass && { state_class: entity.stateClass })
        });
      }
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

    // Update custom entities if any
    if (this.customEntities.length > 0) {
      await this.updateCustomEntities();
    }
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

  getCustomEntities(): CustomEntity[] {
    return this.customEntities;
  }

  clearStateCache(): void {
    this.lastKnownStates = {};
    console.log('State cache cleared - next updates will be forced');
  }

  cleanup(): void {
    this.stopPeriodicUpdates();
  }
} 