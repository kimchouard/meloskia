import { Atom, useStore } from 'jotai';
import { useCallback } from 'react';

/**
 * Returns a stable function that gets the latest value of the atom,
 * without having to subscribe the component to it's changes.
 */
export function useReadAtom<TValue>(atom: Atom<TValue>): () => TValue {
  const store = useStore();

  return useCallback(() => store.get(atom), [atom]);
}
