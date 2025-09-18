import { signal } from '@angular/core';

type Toast = { id: number; message: string; actionLabel?: string; action?: () => void } | null;

const toastSignal = signal<Toast>(null);
const visibleSignal = signal<boolean>(false);

export const toast = {
  get: () => toastSignal(),
  show: (t: Toast) => toastSignal.set(t),
  clear: () => { toastSignal.set(null); visibleSignal.set(false); },
  visible: () => visibleSignal()
};

export function showUndo(message: string, actionLabel: string, action: () => void, ttl = 5000) {
  const id = Date.now();
  toast.show({ id, message, actionLabel, action });
  visibleSignal.set(true);
  setTimeout(() => {
    if (toast.get()?.id === id) toast.clear();
  }, ttl);
}
