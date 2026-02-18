import React, { useRef, useEffect } from 'react';
import styles from './EventLog.module.css';

interface EventLogProps {
  messages: Array<{ id: string; text: string; timestamp: string }>;
}

export const EventLog: React.FC<EventLogProps> = ({ messages }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Event Log</h2>
      <div className={styles.logContainer}>
        {messages.length === 0 ? (
          <p className={styles.emptyState}>No events yet...</p>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={styles.logEntry}>
                <span className={styles.timestamp}>{msg.timestamp}</span>
                <span className={styles.message}>{msg.text}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
