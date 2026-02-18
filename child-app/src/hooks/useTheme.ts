import { useState, useCallback } from 'react';
import type { Theme } from '../../../types/events';

/**
 * Theme management hook
 * Can be extended to persist theme preference
 */
export function useTheme(initialTheme: Theme = 'light') {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
