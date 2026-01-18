import { ComponentTag } from "./component";
import { EntityStore } from "./entity-store";
import { Entity } from "./entity";
import { ComponentStore } from "./component-store";

export type QueryCondition =
  | { type: "has"; component: ComponentTag<any> }
  | { type: "not"; condition: QueryCondition }
  | { type: "and"; conditions: QueryCondition[] }
  | { type: "or"; conditions: QueryCondition[] };

/**
 * Represents a query condition for filtering entities based on their components.
 */
export class Query {
  private relevantTags: Set<ComponentTag<any>> | null = null;

  private constructor(private condition: QueryCondition) {}

  /**
   * Creates an AND query condition.
   * @param args The Queries or ComponentTags to combine with AND.
   * @return A Query representing the conjunction of the input conditions.
   */
  static and(...args: (Query | ComponentTag<any>)[]): Query {
    const conditions: QueryCondition[] = args.map(Query.liftToCondition);
    return new Query({ type: "and", conditions });
  }

  /**
   * Creates an OR query condition.
   * @param args The Queries or ComponentTags to combine with OR logic.
   * @return A Query representing the OR combination of the input conditions.
   */
  static or(...args: (Query | ComponentTag<any>)[]): Query {
    const conditions: QueryCondition[] = args.map(Query.liftToCondition);
    return new Query({ type: "or", conditions });
  }

  /**
   * Creates a NOT query condition.
   * @param arg The Query or ComponentTag to negate.
   * @return A Query representing the negation of the input condition.
   */
  static not(arg: Query | ComponentTag<any>): Query {
    const cond = Query.liftToCondition(arg);
    return new Query({ type: "not", condition: cond });
  }

  /**
   * Creates a query condition that checks for the presence of a component.
   * @param component The ComponentTag to check for.
   * @return A Query representing the presence of the specified component.
   */
  static has(component: Query | ComponentTag<any>): Query {
    if (component instanceof Query) {
      return component;
    }
    return new Query({ type: "has", component });
  }

  /**
   * Lifts a Query or ComponentTag to a QueryCondition.
   * @param arg The Query or ComponentTag to lift.
   * @private
   */
  private static liftToCondition(
    arg: Query | ComponentTag<any>,
  ): QueryCondition {
    if (arg instanceof Query) return arg.condition;
    return { type: "has", component: arg };
  }

  /**
   * Executes the query against the given EntityStore.
   * @param store The EntityStore to query.
   * @return An array of entities matching the query condition.
   */
  execute(store: EntityStore): Entity[] {
    const result: Entity[] = [];
    for (const [entityId, compStore] of store.asMap()) {
      if (Query.matches(compStore, this.condition)) result.push(entityId);
    }
    return result;
  }

  /**
   * Checks if a specific entity in the store matches the query condition.
   * @param store The EntityStore to check against.
   * @param entityId The ID of the entity to check.
   * @return True if the entity matches the query condition, false otherwise.
   */
  matchesEntity(store: EntityStore, entityId: number): boolean {
    const compStore = store.get(entityId);
    if (!compStore) return false;
    return Query.matches(compStore, this.condition);
  }

  /**
   * Checks if a ComponentStore matches the given QueryCondition.
   * @param compStore The ComponentStore to check.
   * @param cond The QueryCondition to match against.
   * @private
   */
  private static matches(
    compStore: ComponentStore,
    cond: QueryCondition,
  ): boolean {
    switch (cond.type) {
      case "has":
        return compStore.has(cond.component);
      case "not":
        return !Query.matches(compStore, cond.condition);
      case "and":
        return cond.conditions.every((c) => Query.matches(compStore, c));
      case "or":
        return cond.conditions.some((c) => Query.matches(compStore, c));
    }
  }

  /**
   * Retrieves all ComponentTags relevant to this query.
   * @return A set of ComponentTags involved in the query condition.
   * @note Caches the result for future calls.
   */
  getComponentTags(): Set<ComponentTag<any>> {
    if (this.relevantTags) return this.relevantTags;
    const set = new Set<ComponentTag<any>>();
    this.collectTags(this.condition, set);
    this.relevantTags = set;
    return set;
  }

  /**
   * Recursively collects ComponentTags from the QueryCondition.
   * @param cond The QueryCondition to process.
   * @param set The set to populate with ComponentTags.
   * @private
   */
  private collectTags(cond: QueryCondition, set: Set<ComponentTag<any>>) {
    switch (cond.type) {
      case "has":
        set.add(cond.component);
        break;
      case "not":
        this.collectTags(cond.condition, set);
        break;
      case "and":
      case "or":
        for (const c of cond.conditions) this.collectTags(c, set);
        break;
    }
  }
}
