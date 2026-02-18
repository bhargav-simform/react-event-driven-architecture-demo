import type { EventCallback, IEventBus } from '../../../types/events';
import { Logger } from '../utils/Logger';

/**
 * Event Bus Implementation
 * Thread-safe pub-sub pattern with error handling and logging
 */
export class EventBus implements IEventBus {
  private events: Map<string, Set<EventCallback>>;
  private logger: Logger;

  constructor() {
    this.events = new Map();
    this.logger = new Logger('EventBus');
  }

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Function to call when event is published
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const callbacks = this.events.get(event)!;
    callbacks.add(callback as EventCallback);

    this.logger.info(`Subscribed to: ${event}`, { subscriberCount: callbacks.size });

    return () => this.unsubscribe(event, callback);
  }

  /**
   * Publish an event with payload
   * @param event - Event name
   * @param payload - Data to pass to subscribers
   */
  publish<T = unknown>(event: string, payload: T): void {
    const callbacks = this.events.get(event);

    if (!callbacks || callbacks.size === 0) {
      this.logger.warn(`No subscribers for event: ${event}`);
      return;
    }

    this.logger.info(`Publishing: ${event}`, { payload, subscriberCount: callbacks.size });

    callbacks.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        this.logger.error(`Error in subscriber for ${event}`, error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  unsubscribe<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);

    if (!callbacks) {
      return;
    }

    callbacks.delete(callback as EventCallback);
    this.logger.info(`Unsubscribed from: ${event}`, { subscriberCount: callbacks.size });

    if (callbacks.size === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Get all registered events (useful for debugging)
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Clear all subscriptions (useful for cleanup/testing)
   */
  clear(): void {
    this.events.clear();
    this.logger.info('All events cleared');
  }
}

// Export singleton instance
export const eventBus = new EventBus();

export default eventBus;

