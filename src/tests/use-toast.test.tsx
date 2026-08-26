import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, dismissToast } from '@/components/ui/Toast';

describe('useToast hook', () => {
  beforeEach(() => {
    // Clear any existing toasts before each test
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toasts.forEach((t) => dismissToast(t.id));
    });
  });


  it('triggers a new toast and updates toasts array', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.toast('Task created successfully', 'success');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Task created successfully');
    expect(result.current.toasts[0].variant).toBe('success');
  });

  it('supports multiple toasts with different variants', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast('Warning: Sprint ending soon', 'warning');
      toast('Error: Connection lost', 'error');
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].variant).toBe('warning');
    expect(result.current.toasts[1].variant).toBe('error');
  });

  it('dismisses a toast by ID correctly', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast('Item to remove', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);
    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});
