import { Logger } from '../utils/Logger';

type EventCallback<T = unknown> = (data: T) => void;

interface IEventBus {
  publish<T>(event: string, data: T): void;
  subscribe<T>(event: string, callback: EventCallback<T>): () => void;
  unsubscribe<T>(event: string, callback: EventCallback<T>): void;
  clear(): void;
}

/**
 * EventBus Implementation for Child App (Standalone Mode)
 * Singleton pattern for global event management
 * Thread-safe with Set-based subscription storage
 */
class EventBus implements IEventBus {
  private events: Map<string, Set<EventCallback>>;
  private logger: Logger;

  constructor() {
    this.events = new Map();
    this.logger = new Logger('EventBus [Child]');
    this.logger.info('EventBus initialized for standalone mode');
  }

  /**
   * Publish an event with data
   */
  publish<T>(event: string, data: T): void {
    const callbacks = this.events.get(event);

    if (!callbacks || callbacks.size === 0) {
      this.logger.warn(`No subscribers for event: ${event}`);
      return;
    }

    this.logger.info(`Publishing event: ${event}`, { subscriberCount: callbacks.size });

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Error in event handler for ${event}`, error);
      }
    });
  }

  /**
   * Subscribe to an event
   * Returns unsubscribe function
   */
  subscribe<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const callbacks = this.events.get(event)!;
    callbacks.add(callback as EventCallback);

    this.logger.info(`Subscribed to: ${event}`, { subscriberCount: callbacks.size });

    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);

    if (!callbacks) {
      this.logger.warn(`No subscribers found for: ${event}`);
      return;
    }

    const deleted = callbacks.delete(callback as EventCallback);

    if (deleted) {
      this.logger.info(`Unsubscribed from: ${event}`, {
        remainingSubscribers: callbacks.size,
      });

      // Clean up empty event sets
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    const eventCount = this.events.size;
    this.events.clear();
    this.logger.info(`Cleared all subscriptions`, { clearedEvents: eventCount });
  }

  /**
   * Get subscriber count for debugging
   */
  getSubscriberCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();
