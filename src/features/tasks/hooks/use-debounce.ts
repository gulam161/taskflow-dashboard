import { useState, useEffect } from 'react';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';

/**
 * Generic debounce hook.
 * Returns a debounced version of `value` that only updates
 * after `delay` milliseconds of inactivity.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in ms (default: 500ms from constants)
 */
export function useDebounce<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
