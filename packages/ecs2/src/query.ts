import { ComponentType } from "./components";
import { Engine } from "./engine";
import { Entity } from "./entity";

/**
 * A Query defines criteria for selecting entities based on their components.
 * It supports logical operations such as AND, OR, and NOT to combine multiple conditions.
 */
export type Query =
  | { all: ComponentType<any, any>[] }
  | { any: ComponentType<any, any>[] }
  | { none: ComponentType<any, any>[] }
  | { only: ComponentType<any, any>[] }
  | { and: Query[] }
  | { or: Query[] }
  | { not: Query };

/**
 * Evaluates whether a given entity matches the specified query criteria.
 *
 * @param engine - The engine instance containing entities and their components.
 * @param entity - The entity to be evaluated against the query.
 * @param query - The query defining the selection criteria.
 * @returns True if the entity matches the query, false otherwise.
 */
export function matchQuery(
  engine: Engine,
  entity: Entity,
  query: Query,
): boolean {
  if ("all" in query) {
    return query.all.every((c) => engine.has(entity, c));
  }

  if ("any" in query) {
    return query.any.some((c) => engine.has(entity, c));
  }

  if ("none" in query) {
    return query.none.every((c) => !engine.has(entity, c));
  }

  if ("only" in query) {
    const required = query.only;
    let count = 0;

    for (const c of required) {
      if (engine.has(entity, c)) count++;
    }

    return count === required.length;
  }

  if ("and" in query) {
    return query.and.every((q) => matchQuery(engine, entity, q));
  }

  if ("or" in query) {
    return query.or.some((q) => matchQuery(engine, entity, q));
  }

  if ("not" in query) {
    return !matchQuery(engine, entity, query.not);
  }

  return false;
}

export class QueryTracker {
  private readonly entities = new Set<Entity>();

  constructor(
    private readonly engine: Engine,
    private readonly query: Query,
  ) {}

  has(entity: Entity): boolean {
    return this.entities.has(entity);
  }

  update(entity: Entity): "enter" | "exit" | "update" | null {
    const matches = matchQuery(this.engine, entity, this.query);
    const has = this.entities.has(entity);

    if (matches && !has) {
      this.entities.add(entity);
      return "enter";
    }

    if (!matches && has) {
      this.entities.delete(entity);
      return "exit";
    }

    if (matches && has) {
      return "update";
    }

    return null;
  }

  remove(entity: Entity): void {
    this.entities.delete(entity);
  }

  *all(): Iterable<Entity> {
    yield* this.entities;
  }
}
