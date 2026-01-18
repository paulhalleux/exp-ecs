import { Query } from "./query";
import { EntityStore } from "./entity-store";
import { Entity } from "./entity";
import { ComponentStore } from "./component-store";

/**
 * Abstract class representing a system that can be enabled or disabled.
 * Provides methods to check and set the enabled state, and an abstract method to get a query.
 */
export abstract class System {
  private enabled: boolean = true;

  protected constructor(public readonly name: string) {}

  /**
   * Checks if the system is enabled.
   * @returns {boolean} True if the system is enabled, false otherwise.
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sets the enabled state of the system.
   * @param {boolean} enabled - The new enabled state.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Abstract method to get a query associated with the system.
   * Must be implemented by subclasses.
   * @returns {Query} The query associated with the system.
   */
  abstract getQuery(): Query;

  /**
   * Abstract method to execute the system's logic.
   * Must be implemented by subclasses.
   * @param {number} delta - The time delta since the last execution.
   * @param {EntityStore} entityStore - The store containing entities and their components.
   * @param {ComponentStore} componentStore - The store containing components for the entity.
   * @param {Entity} entity - The entity to process.
   */
  abstract execute(
    delta: number,
    entityStore: EntityStore,
    componentStore: ComponentStore,
    entity: Entity,
  ): void;
}
