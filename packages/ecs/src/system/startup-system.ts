import { SystemBase } from "./index";
import { Engine } from "../engine";

export type StartupSystem = SystemBase<
  "startup",
  {
    /**
     * Called once when the engine starts up.
     * @param engine The engine instance.
     */
    run: (engine: Engine) => void;
  }
>;

/**
 * Creates a StartupSystem with the provided startup function.
 * @param runFn The function to be called on engine startup.
 * @returns A StartupSystem instance.
 */
export const createStartupSystem = (
  runFn: (engine: Engine) => void,
): StartupSystem => {
  return {
    __kind: "startup",
    run: runFn,
  };
};
