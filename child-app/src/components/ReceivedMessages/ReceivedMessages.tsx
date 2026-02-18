import React from 'react';
import type { AppContext } from '../../utils/contextDetector';
import styles from './ReceivedMessages.module.css';

interface ReceivedMessagesProps {
  messages: Array<{ id: string; text: string; timestamp: string }>;
  parentCounter: number;
  appContext: AppContext;
}

export const ReceivedMessages: React.FC<ReceivedMessagesProps> = ({
  messages,
  parentCounter,
  appContext,
}) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        Received from Parent
        <span className={`${styles.contextBadge} ${styles[appContext]}`}>
          {appContext === 'iframe' ? '📡' : '🔌'}
        </span>
      </h3>

      <div className={styles.counterDisplay}>
        <span className={styles.label}>Parent Counter:</span>
        <span className={styles.value}>{parentCounter}</span>
      </div>

      <div className={styles.logContainer}>
        {messages.length === 0 ? (
          <p className={styles.emptyState}>
            {appContext === 'iframe' 
              ? 'No messages yet...' 
              : 'Running in standalone mode - no parent connection'}
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={styles.logEntry}>
              <span className={styles.timestamp}>{msg.timestamp}</span>
              <span className={styles.message}>{msg.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
