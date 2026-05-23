"use client";

import { useEffect, useReducer } from "react";
import { subscribe } from "@/lib/store";

/**
 * Forces a re-render whenever the in-memory store emits a change.
 * Use in components that read directly from store getters.
 */
export function useStoreSubscription(): void {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const unsub = subscribe(forceUpdate);
    return unsub;
  }, []);
}
