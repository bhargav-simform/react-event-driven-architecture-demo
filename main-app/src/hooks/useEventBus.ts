import { useEffect, useRef } from 'react';
import { eventBus } from '../event-bus/eventBus';
import type { EventCallback } from '../../../types/events';

/**
 * Custom hook for subscribing to event bus
 * Handles automatic cleanup on unmount
 */
export function useEventBus<T = unknown>(
  event: string,
  callback: EventCallback<T>,
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(event, (payload) => {
      callbackRef.current(payload as T);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}
