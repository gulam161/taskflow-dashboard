import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';
import { formatDate, formatShortDate, isOverdue } from '@/utils/date';
import { storage } from '@/utils/storage';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should combine multiple class names', () => {
      expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
    });

    it('should ignore falsey values', () => {
      const isHidden = false;
      expect(cn('btn', isHidden && 'hidden', undefined, null, 'active')).toBe('btn active');
    });
  });

  describe('Date utilities', () => {
    it('should format date to readable format', () => {
      const formatted = formatDate('2026-08-22');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Aug');
    });

    it('should format short date', () => {
      const shortFormatted = formatShortDate('2026-08-22');
      expect(shortFormatted).toContain('Aug');
    });

    it('should correctly identify overdue dates', () => {
      expect(isOverdue('2020-01-01')).toBe(true);
      expect(isOverdue('2099-01-01')).toBe(false);
    });
  });

  describe('Storage abstraction', () => {
    it('should set and get values from storage safely', () => {
      storage.set('test_key', { foo: 'bar' });
      const value = storage.get<{ foo: string }>('test_key');
      expect(value).toEqual({ foo: 'bar' });
      storage.remove('test_key');
      expect(storage.get('test_key')).toBeNull();
    });
  });
});
