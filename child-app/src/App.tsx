import { useEffect, useState, useCallback } from 'react';
import { ChildControls } from './components/ChildControls/ChildControls';
import { ReceivedMessages } from './components/ReceivedMessages/ReceivedMessages';
import { messageListener } from './listeners/messageListener';
import { useTheme } from './hooks/useTheme';
import { ContextDetector, type AppContext } from './utils/contextDetector';
import { EVENT_TYPES } from '../../types/events';
import styles from './App.module.css';
import './styles/global.css';

interface LogMessage {
  id: string;
  text: string;
  timestamp: string;
}

/**
 * Child App
 * Dual-Mode Operation:
 * - Iframe Mode: Communicates with parent via postMessage
 * - Standalone Mode: Works independently with internal EventBus
 */
function App() {
  const { theme, setTheme } = useTheme();
  const [parentCounter, setParentCounter] = useState(0);
  const [childCounter, setChildCounter] = useState(0);
  const [receivedMessages, setReceivedMessages] = useState<LogMessage[]>([]);
  const [appContext, setAppContext] = useState<AppContext>('standalone');

  const addReceivedMessage = useCallback((text: string): void => {
    const newMessage: LogMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setReceivedMessages((prev) => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    // Detect context on mount - runs only once
    const context = ContextDetector.getContext();
    setAppContext(context);
    
    // Initialize messages based on context
    const initMessages: LogMessage[] = [
      {
        id: `${Date.now()}-init`,
        text: `🚀 App started in ${context.toUpperCase()} mode`,
        timestamp: new Date().toLocaleTimeString(),
      }
    ];

    if (context === 'standalone') {
      initMessages.push({
        id: `${Date.now()}-standalone`,
        text: 'ℹ️ Running independently - parent communication disabled',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    setReceivedMessages(initMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  useEffect(() => {
    // Listen to INIT message from parent
    const unsubscribeInit = messageListener.on(EVENT_TYPES.INIT, (data: { message: string }) => {
      addReceivedMessage(`Init: ${data.message}`);
    });

    // Listen to theme updates from parent
    const unsubscribeTheme = messageListener.on(EVENT_TYPES.THEME_UPDATE, (data: { theme: 'light' | 'dark' }) => {
      setTheme(data.theme);
      addReceivedMessage(`Theme updated to: ${data.theme}`);
    });

    // Listen to user actions from parent
    const unsubscribeUserAction = messageListener.on(EVENT_TYPES.USER_ACTION_UPDATE, (data: { count: number }) => {
      setParentCounter(data.count);
      addReceivedMessage(`Parent counter: ${data.count}`);
    });

    // In standalone mode, also listen to own events for demo purposes
    let unsubscribeChildCounter: (() => void) | null = null;
    let unsubscribeChildButton: (() => void) | null = null;

    if (appContext === 'standalone') {
      unsubscribeChildCounter = messageListener.on(EVENT_TYPES.COUNTER_UPDATE, (data: { count: number }) => {
        addReceivedMessage(`[Demo] Child counter event: ${data.count}`);
      });

      unsubscribeChildButton = messageListener.on(EVENT_TYPES.BUTTON_CLICKED, (data: { message: string }) => {
        addReceivedMessage(`[Demo] Button click event: ${data.message}`);
      });
    }

    return () => {
      unsubscribeInit();
      unsubscribeTheme();
      unsubscribeUserAction();
      if (unsubscribeChildCounter) unsubscribeChildCounter();
      if (unsubscribeChildButton) unsubscribeChildButton();
    };
  }, [addReceivedMessage, setTheme, appContext]);

  const handleButtonClick = useCallback((): void => {
    messageListener.sendToParent(EVENT_TYPES.BUTTON_CLICKED, {
      message: 'Hello from Child!',
      timestamp: new Date().toISOString(),
    });
    addReceivedMessage('Sent button click to parent');
  }, [addReceivedMessage]);

  const handleChildCounterIncrement = useCallback((): void => {
    const newCount = childCounter + 1;
    setChildCounter(newCount);
    
    messageListener.sendToParent(EVENT_TYPES.COUNTER_UPDATE, {
      count: newCount,
    });
    addReceivedMessage(`Child counter: ${newCount}`);
  }, [childCounter, addReceivedMessage]);

  return (
    <div className={styles.app} data-theme={theme}>
      <header className={styles.header}>
        <h2>
          {appContext === 'iframe' ? '👶 Child App (Inside Iframe)' : '🌟 Child App (Standalone)'}
        </h2>
        <div className={styles.badges}>
          <span className={styles.themeBadge}>Theme: {theme}</span>
          <span className={`${styles.modeBadge} ${styles[appContext]}`}>
            {appContext === 'iframe' ? '📡 Connected' : '🔌 Standalone'}
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <ChildControls
            childCounter={childCounter}
            onButtonClick={handleButtonClick}
            onCounterIncrement={handleChildCounterIncrement}
            appContext={appContext}
          />
          <ReceivedMessages
            messages={receivedMessages}
            parentCounter={parentCounter}
            appContext={appContext}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
