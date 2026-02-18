import React, { useEffect, useRef, useCallback, useState } from 'react';
import { eventBus } from '../event-bus/eventBus';
import { EVENT_TYPES, type EventMessage } from '../../../types/events';
import { Logger } from '../utils/Logger';
import styles from './IframeWrapper.module.css';

interface IframeWrapperProps {
  src: string;
  title?: string;
  allowedOrigin?: string;
}

const logger = new Logger('IframeWrapper');

/**
 * IframeWrapper Component
 * Handles secure bidirectional communication with child app
 * Implements origin verification and error handling
 */
export const IframeWrapper: React.FC<IframeWrapperProps> = ({
  src,
  title = 'Child Application',
  allowedOrigin = '*', // In production, specify exact origin
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessageToChild = useCallback(
    <T,>(type: string, payload: T): void => {
      if (!iframeRef.current?.contentWindow) {
        logger.warn('Cannot send message: iframe not ready');
        return;
      }

      if (!isLoaded) {
        logger.warn('Cannot send message: iframe not loaded');
        return;
      }

      const message: EventMessage<T> = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        source: 'parent',
      };

      logger.info('Sending to child', message);

      try {
        iframeRef.current.contentWindow.postMessage(message, allowedOrigin);
      } catch (err) {
        logger.error('Failed to send message to child', err);
        setError('Failed to communicate with child application');
      }
    },
    [isLoaded, allowedOrigin]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      // Security: Verify origin in production
      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) {
        logger.warn('Message from unauthorized origin', { origin: event.origin });
        return;
      }

      const message = event.data as EventMessage;

      if (!message || typeof message !== 'object' || !message.type) {
        logger.warn('Invalid message format', event.data);
        return;
      }

      logger.info('Received from child', message);

      // Publish to internal event bus with CHILD_ prefix
      eventBus.publish(`CHILD_${message.type}`, message.payload);
    };

    window.addEventListener('message', handleMessage);

    // Subscribe to parent events that should be forwarded to child
    const unsubscribeTheme = eventBus.subscribe(EVENT_TYPES.THEME_UPDATE, (data: unknown) => {
      sendMessageToChild(EVENT_TYPES.THEME_UPDATE, data);
    });

    const unsubscribeUserAction = eventBus.subscribe(EVENT_TYPES.USER_ACTION_UPDATE, (data: unknown) => {
      sendMessageToChild(EVENT_TYPES.USER_ACTION_UPDATE, data);
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      unsubscribeTheme();
      unsubscribeUserAction();
    };
  }, [sendMessageToChild, allowedOrigin]);

  const handleIframeLoad = useCallback((): void => {
    logger.info('Iframe loaded');
    setIsLoaded(true);
    setError(null);

    // Send initialization message
    sendMessageToChild(EVENT_TYPES.INIT, {
      message: 'Welcome from Parent!',
      timestamp: new Date().toISOString(),
    });
  }, [sendMessageToChild]);

  const handleIframeError = useCallback((): void => {
    logger.error('Iframe failed to load');
    setIsLoaded(false);
    setError('Failed to load child application');
  }, []);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Child Application</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{title}</h3>
        {!isLoaded && <span className={styles.loadingIndicator}>Loading...</span>}
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className={styles.iframe}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};


