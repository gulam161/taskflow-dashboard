import clsx, { type ClassValue } from 'clsx';

/**
 * Utility to merge class names conditionally.
 * Wraps clsx for consistent usage across the project.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
