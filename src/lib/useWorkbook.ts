import { useEffect, useState } from "react";
import { loadState, saveState, createInitialState } from "./storage";
import type { WorkbookState } from "./types";

export function useWorkbook() {
  const [state, setState] = useState<WorkbookState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  function patch(updater: (prev: WorkbookState) => WorkbookState) {
    setState(updater);
  }

  function reset() {
    const fresh = createInitialState();
    setState(fresh);
    saveState(fresh);
  }

  return { state, patch, reset, hydrated };
}
