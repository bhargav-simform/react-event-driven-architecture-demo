/**
 * Shared event types for parent-child communication
 * Ensures type safety across iframe boundaries
 */

export const EVENT_TYPES = {
  // Parent to Child
  INIT: 'INIT',
  THEME_UPDATE: 'THEME_UPDATE',
  USER_ACTION_UPDATE: 'USER_ACTION_UPDATE',
  
  // Child to Parent
  BUTTON_CLICKED: 'BUTTON_CLICKED',
  COUNTER_UPDATE: 'COUNTER_UPDATE',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export type Theme = 'light' | 'dark';

// Discriminated union for type-safe events
export type EventPayload =
  | { type: typeof EVENT_TYPES.INIT; payload: { message: string; timestamp?: string } }
  | { type: typeof EVENT_TYPES.THEME_UPDATE; payload: { theme: Theme } }
  | { type: typeof EVENT_TYPES.USER_ACTION_UPDATE; payload: { action: string; count: number } }
  | { type: typeof EVENT_TYPES.BUTTON_CLICKED; payload: { message: string; timestamp: string } }
  | { type: typeof EVENT_TYPES.COUNTER_UPDATE; payload: { count: number } };

export interface EventMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: string;
  source?: string;
}

export type EventCallback<T = unknown> = (payload: T) => void;

export interface IEventBus {
  subscribe<T = unknown>(event: string, callback: EventCallback<T>): () => void;
  publish<T = unknown>(event: string, payload: T): void;
  unsubscribe<T = unknown>(event: string, callback: EventCallback<T>): void;
  clear(): void;
}
