import { SystemBase } from "./index";
import { Engine } from "../engine";

export type CleanupSystem = SystemBase<
  "cleanup",
  {
    /**
     * Called once when the engine is cleaned up.
     * @param engine The engine instance.
     */
    run: (engine: Engine) => void;
  }
>;

/**
 * Creates a CleanupSystem with the provided cleanup function.
 * @param runFn The function to be called on engine cleanup.
 * @returns A CleanupSystem instance.
 */
export const createCleanupSystem = (
  runFn: (engine: Engine) => void,
): CleanupSystem => {
  return {
    __kind: "cleanup",
    run: runFn,
  };
};
