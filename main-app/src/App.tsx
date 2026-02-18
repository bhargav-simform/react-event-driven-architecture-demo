import { useCallback, useState } from 'react';
import { IframeWrapper } from './iframe/IframeWrapper';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { EventLog } from './components/EventLog/EventLog';
import { useEventBus } from './hooks/useEventBus';
import { useTheme } from './hooks/useTheme';
import { eventBus } from './event-bus/eventBus';
import { EVENT_TYPES } from '../../types/events';
import styles from './App.module.css';
import './styles/global.css';

interface LogMessage {
  id: string;
  text: string;
  timestamp: string;
}

/**
 * Main Application
 * Demonstrates production-ready event-driven architecture
 */
function App() {
  const { theme, toggleTheme } = useTheme();
  const [counter, setCounter] = useState(0);
  const [messages, setMessages] = useState<LogMessage[]>([]);

  const addMessage = useCallback((text: string): void => {
    const newMessage: LogMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Subscribe to child events
  useEventBus(`CHILD_${EVENT_TYPES.BUTTON_CLICKED}`, (data: { message: string }) => {
    addMessage(`Child clicked button: ${data.message}`);
  });

  useEventBus(`CHILD_${EVENT_TYPES.COUNTER_UPDATE}`, (data: { count: number }) => {
    addMessage(`Child counter updated: ${data.count}`);
  });

  const handleThemeToggle = useCallback((): void => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    eventBus.publish(EVENT_TYPES.THEME_UPDATE, { theme: newTheme });
    addMessage(`Theme changed to ${newTheme}`);
  }, [theme, toggleTheme, addMessage]);

  const handleCounterIncrement = useCallback((): void => {
    const newCounter = counter + 1;
    setCounter(newCounter);
    
    eventBus.publish(EVENT_TYPES.USER_ACTION_UPDATE, {
      action: 'INCREMENT',
      count: newCounter,
    });
    addMessage(`Parent counter: ${newCounter}`);
  }, [counter, addMessage]);

  return (
    <div className={styles.app} data-theme={theme}>
      <header className={styles.header}>
        <h1>🚀 Event-Driven Architecture Demo</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <ControlPanel
            theme={theme}
            counter={counter}
            onThemeToggle={handleThemeToggle}
            onCounterIncrement={handleCounterIncrement}
          />a
          <EventLog messages={messages} />
        </div>

        <div className={styles.iframeSection}>
          <IframeWrapper
            src="http://localhost:5174"
            title="Child Application"
            allowedOrigin="*"
          />
        </div>
      </main>
    </div>
  );
}

export default App;
