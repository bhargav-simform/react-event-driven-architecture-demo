import React from 'react';
import type { Theme } from '../../../../types/events';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  theme: Theme;
  counter: number;
  onThemeToggle: () => void;
  onCounterIncrement: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  theme,
  counter,
  onThemeToggle,
  onCounterIncrement,
}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Control Panel</h2>

      <div className={styles.controls}>
        <button onClick={onThemeToggle} className={styles.themeButton}>
          Toggle Theme
          <span className={styles.badge}>{theme}</span>
        </button>

        <button onClick={onCounterIncrement} className={styles.counterButton}>
          Increment Counter
          <span className={styles.badge}>{counter}</span>
        </button>
      </div>

      <div className={styles.infoBox}>
        <strong>💡 How it works:</strong>
        <ul>
          <li>Actions publish events to EventBus</li>
          <li>IframeWrapper listens and forwards to child</li>
          <li>Child app responds with its own events</li>
          <li>No direct coupling between components</li>
        </ul>
      </div>
    </div>
  );
};
