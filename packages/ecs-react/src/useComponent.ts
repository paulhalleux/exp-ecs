import type { ComponentType, Entity } from "@ptl/ecs";
import { useEngine } from "./EngineProvider.tsx";
import React from "react";

export function useComponent<T>(
  entity: Entity,
  type: ComponentType<any, T>,
): T | undefined {
  const engine = useEngine();
  const store = engine.getComponentStore(type);
  return React.useSyncExternalStore(
    (callback) => store.subscribe(entity, callback),
    () => {
      return engine.get(entity, type);
    },
  );
}
