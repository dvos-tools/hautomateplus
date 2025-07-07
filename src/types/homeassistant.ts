export interface HAMessage {
  type: string;
  id?: number;
  event?: HAEvent;
}

export interface HAEvent {
  event_type: string;
  data: any;
  origin: string;
  time_fired: string;
  context: HAEventContext;
}

export interface HAEventContext {
  id: string;
  parent_id: null | string;
  user_id: null | string;
}

export interface LocalControlEventData {
  message?: string;
  action?: string;
}

export interface AuthMessage {
  type: 'auth';
  access_token: string;
}

export interface SubscribeMessage {
  id: number;
  type: 'subscribe_events';
  event_type: string;
}

// Custom Entity Types
export interface CustomEntity {
  name: string;
  shortcutName: string;  // Name of the shortcut to run
  filePath: string;      // Where the shortcut writes its output
  entityId?: string;
  entityType?: 'sensor' | 'binary_sensor' | 'switch';
  unitOfMeasurement?: string;
  deviceClass?: string;
  stateClass?: string;
  attributes?: Record<string, any>;
}

export interface CustomEntityConfig {
  enabled: boolean;
  entities: CustomEntity[];
}

export interface CustomEntityState {
  entityId: string;
  state: string;
  attributes: Record<string, any>;
  lastUpdated: Date;
} 