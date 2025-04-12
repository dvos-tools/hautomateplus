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