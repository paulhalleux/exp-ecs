import type { Entity, QueryComponent } from "@ptl/ecs";
import React from "react";
import { useEngine } from "./EngineProvider.tsx";

export function useQuery(query: QueryComponent): readonly Entity[] {
  const engine = useEngine();
  const cacheRef = React.useRef<readonly Entity[] | null>(null);

  const tracker = React.useMemo(
    () => engine.getQueryTracker(query),
    [engine, JSON.stringify(query)],
  );

  return React.useSyncExternalStore(
    (callback) => {
      const cb = () => {
        cacheRef.current = null;
        callback();
      };

      return tracker.subscribe({
        onEnter: cb,
        onExit: cb,
        onUpdate: cb,
      });
    },
    () => {
      if (cacheRef.current) {
        return cacheRef.current;
      }
      const entities = Array.from(tracker.all());
      cacheRef.current = entities;
      return entities;
    },
  );
}
