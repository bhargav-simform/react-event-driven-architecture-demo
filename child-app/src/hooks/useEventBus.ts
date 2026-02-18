import { useEffect, useRef } from 'react';
import { eventBus } from '../event-bus/eventBus';

type EventCallback<T = unknown> = (data: T) => void;

/**
 * Custom hook for EventBus subscriptions (Standalone Mode)
 * Automatically manages subscription lifecycle
 * Prevents stale closures with useRef
 */
export function useEventBus<T = unknown>(
  event: string,
  callback: EventCallback<T>,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef<EventCallback<T>>(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    // Wrapper to use the latest callback from ref
    const handler: EventCallback<T> = (data: T) => {
      callbackRef.current(data);
    };

    const unsubscribe = eventBus.subscribe<T>(event, handler);

    return () => {
      unsubscribe();
    };
  }, [event]);
}
