import { Entity } from "../entity";
import { BaseComponent, ComponentKind, ComponentLifetime } from "./index";

/**
 * A store for managing components associated with entities.
 *
 * @template T - The type of component to be stored, extending BaseComponent.
 */
export class ComponentStore<T extends BaseComponent<ComponentKind, any>> {
  private readonly map = new Map<Entity, T>();

  constructor(public readonly lifetime: ComponentLifetime) {}

  /**
   * Retrieves the component associated with the given entity.
   *
   * @param entity - The entity whose component is to be retrieved.
   * @returns The component associated with the entity, or undefined if not found.
   */
  get(entity: Entity): T | undefined {
    return this.map.get(entity);
  }

  /**
   * Safely retrieves the component associated with the given entity.
   * Throws an error if the component is not found.
   *
   * @param entity - The entity whose component is to be retrieved.
   * @returns The component associated with the entity.
   * @throws Error if the component is not found for the entity.
   */
  safeGet(entity: Entity): T {
    const value = this.map.get(entity);
    if (!value) {
      throw new Error(`Component not found for entity ${entity}`);
    }
    return value;
  }

  /**
   * Checks if a component exists for the given entity.
   *
   * @param entity - The entity to check for a component.
   * @returns True if a component exists for the entity, false otherwise.
   */
  has(entity: Entity): boolean {
    return this.map.has(entity);
  }

  /**
   * Sets the component for the given entity.
   *
   * @param entity - The entity for which to set the component.
   * @param value - The component to be associated with the entity.
   */
  set(entity: Entity, value: T): void {
    this.map.set(entity, value);
  }

  /**
   * Deletes the component associated with the given entity.
   *
   * @param entity - The entity whose component is to be deleted.
   */
  delete(entity: Entity): void {
    this.map.delete(entity);
  }

  /**
   * Replaces the component for the given entity using a provided function.
   *
   * @param entity - The entity whose component is to be replaced.
   * @param updater - A function that takes the old component value and returns the new component value.
   * @throws Error if the component is not found for the entity.
   */
  replace(entity: Entity, updater: ((oldValue: Readonly<T>) => T) | T): void {
    const oldValue = this.safeGet(entity);
    this.map.set(
      entity,
      typeof updater === "function"
        ? (updater as (oldValue: T) => T)(oldValue)
        : updater,
    );
  }

  /**
   * Returns an iterator over the entries in the component store.
   *
   * @returns An iterator of [Entity, T] pairs.
   */
  entries(): MapIterator<[number, T]> {
    return this.map.entries();
  }

  /**
   * Clears all components from the store.
   */
  clear(): void {
    this.map.clear();
  }
}
