import React from "react";
import type { Engine } from "@ptl/ecs";

export const EngineContext = React.createContext<Engine | null>(null);

export function EngineProvider({
  engine,
  children,
}: {
  engine: Engine;
  children: React.ReactNode;
}) {
  return (
    <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
  );
}

export function useEngine(): Engine {
  const engine = React.useContext(EngineContext);
  if (!engine) {
    throw new Error("useEngine must be used inside EngineContext");
  }
  return engine;
}
