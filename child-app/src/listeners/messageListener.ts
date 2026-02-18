import type { EventCallback, EventMessage } from '../../../types/events';
import { Logger } from '../utils/Logger';
import { ContextDetector } from '../utils/contextDetector';
import { eventBus } from '../event-bus/eventBus';

/**
 * Message Listener for Child App
 * Supports dual-mode operation:
 * - Iframe Mode: postMessage communication with parent
 * - Standalone Mode: Internal EventBus communication
 */
class MessageListener {
  private handlers: Map<string, Set<EventCallback>>;
  private logger: Logger;
  private isIframeMode: boolean;

  constructor() {
    this.handlers = new Map();
    this.logger = new Logger('MessageListener');
    this.isIframeMode = ContextDetector.getContext() === 'iframe';
    this.init();
  }

  /**
   * Initialize message listener based on context
   */
  private init(): void {
    if (this.isIframeMode) {
      window.addEventListener('message', this.handleMessage.bind(this));
      this.logger.info('Message listener initialized (IFRAME MODE)');
    } else {
      this.logger.info('Message listener initialized (STANDALONE MODE - using EventBus)');
    }
    
    ContextDetector.logContextInfo();
  }

  /**
   * Handle incoming messages from parent
   */
  private handleMessage(event: MessageEvent): void {
    // Security: In production, verify event.origin
    // if (event.origin !== 'http://localhost:3000') return;

    const message = event.data as EventMessage;

    if (!message || typeof message !== 'object' || !message.type) {
      this.logger.warn('Invalid message format', event.data);
      return;
    }

    this.logger.info('Received message', message);

    const handlers = this.handlers.get(message.type);
    if (!handlers || handlers.size === 0) {
      this.logger.warn(`No handler for message type: ${message.type}`);
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(message.payload);
      } catch (error) {
        this.logger.error(`Error handling message type ${message.type}`, error);
      }
    });
  }

  /**
   * Register a handler for a specific message type
   * Dual-mode: Works in both iframe and standalone
   */
  on<T = unknown>(type: string, handler: EventCallback<T>): () => void {
    if (this.isIframeMode) {
      // Iframe mode: Use postMessage handlers
      if (!this.handlers.has(type)) {
        this.handlers.set(type, new Set());
      }

      const handlers = this.handlers.get(type)!;
      handlers.add(handler as EventCallback);

      this.logger.info(`[IFRAME] Registered handler for: ${type}`, { handlerCount: handlers.size });

      return () => this.off(type, handler);
    } else {
      // Standalone mode: Use internal EventBus
      this.logger.info(`[STANDALONE] Registered handler for: ${type}`);
      return eventBus.subscribe<T>(type, handler);
    }
  }

  /**
   * Unregister a handler
   */
  off<T = unknown>(type: string, handler: EventCallback<T>): void {
    const handlers = this.handlers.get(type);
    if (!handlers) return;

    handlers.delete(handler as EventCallback);
    this.logger.info(`Unregistered handler for: ${type}`, { handlerCount: handlers.size });

    if (handlers.size === 0) {
      this.handlers.delete(type);
    }
  }

  /**
   * Send message to parent window (iframe) or emit event (standalone)
   * Dual-mode: Adapts based on context
   */
  sendToParent<T = unknown>(type: string, payload: T): void {
    if (this.isIframeMode) {
      // Iframe mode: Send via postMessage
      if (!window.parent || window.parent === window) {
        this.logger.warn('[IFRAME] No parent window found');
        return;
      }

      const message: EventMessage<T> = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        source: 'child',
      };

      this.logger.info('[IFRAME] Sending to parent', message);

      try {
        window.parent.postMessage(message, '*'); // Use specific origin in production
      } catch (error) {
        this.logger.error('[IFRAME] Failed to send message to parent', error);
      }
    } else {
      // Standalone mode: Publish to internal EventBus
      this.logger.info('[STANDALONE] Publishing event (demo mode)', { type, payload });
      eventBus.publish(type, payload);
    }
  }

  /**
   * Get current operation mode
   */
  getMode(): 'iframe' | 'standalone' {
    return this.isIframeMode ? 'iframe' : 'standalone';
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.logger.info('All handlers cleared');
  }
}

// Export singleton instance
export const messageListener = new MessageListener();

