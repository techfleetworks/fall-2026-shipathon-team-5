import { storage } from '#imports';
import type { CheckState } from './types';

// session: storage is cleared when the browser closes, so we never keep
// a long history of what someone checked.
export const lastCheck = storage.defineItem<CheckState | null>('session:lastCheck', {
  fallback: null,
});
