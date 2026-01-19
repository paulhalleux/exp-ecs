import { Query } from "../query";
import { SystemBase } from "./index";
import { Entity } from "../entity";
import { Engine } from "../engine";

/**
 * A system that operates based on entity queries.
 */
export type QuerySystem = SystemBase<
  "query",
  {
    query: Query;
    onEnter?(engine: Engine, entity: Entity): void;
    onUpdate?(engine: Engine, entity: Entity): void;
    onExit?(engine: Engine, entity: Entity): void;
  }
>;

/**
 * Creates a QuerySystem with the provided query and lifecycle functions.
 * @param query The entity query to match entities.
 * @param onEnter Function called when an entity enters the query.
 * @param onUpdate Function called when an entity is updated within the query.
 * @param onExit Function called when an entity exits the query.
 * @returns A QuerySystem instance.
 */
export const createQuerySystem = (
  query: Query,
  onEnter?: (engine: Engine, entity: Entity) => void,
  onUpdate?: (engine: Engine, entity: Entity) => void,
  onExit?: (engine: Engine, entity: Entity) => void,
): QuerySystem => {
  return {
    __kind: "query",
    query,
    onEnter,
    onUpdate,
    onExit,
  };
};
