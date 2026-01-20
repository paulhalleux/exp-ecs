import { QueryComponent } from "../query";
import { SystemBase } from "./index";
import { Entity } from "../entity";
import { Engine } from "../engine";

/**
 * A system that operates based on entity queries.
 */
export type QuerySystem = SystemBase<
  "query",
  {
    query: QueryComponent;
    onEnter?(engine: Engine, entity: Entity): void;
    onUpdate?(engine: Engine, entity: Entity): void;
    onExit?(engine: Engine, entity: Entity): void;
  }
>;

/**
 * Creates a QuerySystem with the provided query and lifecycle functions.
 * @param query The entity query to match entities.
 * @param callbacks Lifecycle functions for entity events.
 * @returns A QuerySystem instance.
 */
export const createQuerySystem = (
  query: QueryComponent,
  callbacks: {
    onEnter?: (engine: Engine, entity: Entity) => void;
    onUpdate?: (engine: Engine, entity: Entity) => void;
    onExit?: (engine: Engine, entity: Entity) => void;
  } = {},
): QuerySystem => {
  return {
    __kind: "query",
    query,
    ...callbacks,
  };
};
