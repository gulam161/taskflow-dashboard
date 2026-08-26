import { useState, useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

type Listener = () => void;
let toasts: ToastData[] = [];
const listeners: Set<Listener> = new Set();
let idCounter = 0;

function emit() {
  listeners.forEach((fn) => fn());
}

export function toast(
  message: string,
  variant: ToastVariant = 'info',
  duration = 4000
) {
  const id = `toast-${++idCounter}`;
  toasts = [...toasts, { id, message, variant, duration }];
  emit();
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useToasts() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return toasts;
}

export function useToast() {
  const allToasts = useToasts();
  return {
    toast,
    dismissToast,
    toasts: allToasts,
  };
}

