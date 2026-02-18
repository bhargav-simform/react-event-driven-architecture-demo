import { Logger } from './Logger';

const logger = new Logger('ContextDetector');

export type AppContext = 'iframe' | 'standalone';

/**
 * Context Detector Utility
 * Detects whether app is running inside iframe or standalone
 */
export class ContextDetector {
  private static context: AppContext | null = null;

  /**
   * Check if app is running inside an iframe
   */
  static isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      // If access to window.top is blocked (cross-origin), we're definitely in an iframe
      return true;
    }
  }

  /**
   * Get the current app context
   */
  static getContext(): AppContext {
    if (this.context === null) {
      this.context = this.isInIframe() ? 'iframe' : 'standalone';
      logger.info(`Detected context: ${this.context}`);
    }
    return this.context;
  }

  /**
   * Check if we can communicate with parent window
   */
  static canCommunicateWithParent(): boolean {
    if (!this.isInIframe()) {
      return false;
    }

    try {
      // Try to access parent - if it throws, communication is blocked
      return window.parent !== window.self;
    } catch (e) {
      logger.warn('Cannot communicate with parent', e);
      return false;
    }
  }

  /**
   * Get parent origin (if available)
   */
  static getParentOrigin(): string | null {
    if (!this.isInIframe()) {
      return null;
    }

    try {
      return document.referrer ? new URL(document.referrer).origin : null;
    } catch (e) {
      logger.warn('Cannot determine parent origin', e);
      return null;
    }
  }

  /**
   * Log context information for debugging
   */
  static logContextInfo(): void {
    const context = this.getContext();
    const canCommunicate = this.canCommunicateWithParent();
    const parentOrigin = this.getParentOrigin();

    logger.info('Context Information', {
      context,
      canCommunicate,
      parentOrigin,
      windowSelf: window.self === window,
      windowTop: window.self === window.top,
    });
  }
}
