import React from 'react';
import type { AppContext } from '../../utils/contextDetector';
import styles from './ChildControls.module.css';

interface ChildControlsProps {
  childCounter: number;
  onButtonClick: () => void;
  onCounterIncrement: () => void;
  appContext: AppContext;
}

export const ChildControls: React.FC<ChildControlsProps> = ({
  childCounter,
  onButtonClick,
  onCounterIncrement,
  appContext,
}) => {
  const isStandalone = appContext === 'standalone';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Child Controls</h3>

      <div className={styles.controls}>
        <button 
          onClick={onButtonClick} 
          className={styles.sendButton}
          disabled={isStandalone}
          title={isStandalone ? 'Not available in standalone mode' : 'Send message to parent'}
        >
          Send Message to Parent
          <span className={styles.icon}>{isStandalone ? '🔌' : '📤'}</span>
        </button>
        {isStandalone && (
          <p className={styles.standaloneNote}>
            ℹ️ Parent communication only works in iframe mode
          </p>
        )}

        <button onClick={onCounterIncrement} className={styles.counterButton}>
          Child Counter
          <span className={styles.badge}>{childCounter}</span>
        </button>
      </div>
    </div>
  );
};
