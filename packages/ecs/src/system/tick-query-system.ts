import { Engine } from "../engine";
import { SystemBase } from "./index";
import { QueryComponent } from "../query";
import { Entity } from "../entity";

/**
 * A system that performs actions on each tick of the engine.
 */
export type TickQuerySystem = SystemBase<
  "tick-query",
  {
    /**
     * Called on each tick of the engine.
     * @param engine
     * @param dt
     */
    tick: (engine: Engine, entity: Entity, dt: number) => void;
    /**
     * The entity query to match entities.
     */
    query: QueryComponent;
  }
>;

/**
 * Creates a TickSystem with the provided tick function.
 * @param query The entity query to match entities.
 * @param tickFn The function to be called on each tick.
 * @returns A TickSystem instance.
 */
export const createTickQuerySystem = (
  query: QueryComponent,
  tickFn: (engine: Engine, entity: Entity, dt: number) => void,
): TickQuerySystem => {
  return {
    __kind: "tick-query",
    tick: tickFn,
    query,
  };
};
