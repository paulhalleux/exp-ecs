import { Engine } from "../engine";
import { SystemBase } from "./index";

/**
 * A system that performs actions on each tick of the engine.
 */
export type TickSystem = SystemBase<
  "tick",
  {
    /**
     * Called on each tick of the engine.
     * @param engine
     * @param dt
     */
    tick: (engine: Engine, dt: number) => void;
  }
>;

/**
 * Creates a TickSystem with the provided tick function.
 * @param tickFn The function to be called on each tick.
 * @returns A TickSystem instance.
 */
export const createTickSystem = (
  tickFn: (engine: Engine, dt: number) => void,
): TickSystem => {
  return {
    __kind: "tick",
    tick: tickFn,
  };
};
