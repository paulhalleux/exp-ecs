import { ComponentTag } from "./component";

/**
 * Manages components associated with an entity.
 */
export class ComponentStore {
  private components: Map<string, any> = new Map();

  constructor(
    private readonly notifyChange: (tag: ComponentTag<any>) => void,
  ) {}

  /**
   * Sets a component in the store.
   * @param componentTag - The tag of the component.
   * @param component The component instance to store.
   */
  set<T>(componentTag: ComponentTag<T>, component: T): void {
    this.components.set(componentTag.__tag, component);
    this.notifyChange(componentTag);
  }

  /**
   * Gets a component from the store.
   * @param componentTag - The tag of the component.
   * @return The component instance, or undefined if not found.
   */
  get<T>(componentTag: ComponentTag<T>): T | undefined {
    return this.components.get(componentTag.__tag);
  }

  /**
   * Safely gets a component from the store, throwing an error if not found.
   * @param componentTag - The tag of the component.
   * @return The component instance.
   * @throws {Error} If the component is not found.
   */
  safeGet<T>(componentTag: ComponentTag<T>): T {
    const component = this.get(componentTag);
    if (component === undefined) {
      throw new Error(`Component not found in store: ${componentTag.__tag}`);
    }
    return component;
  }

  /**
   * Checks if a component exists in the store.
   * @param componentTag - The tag of the component.
   * @return {boolean} True if the component exists, false otherwise.
   */
  has<T>(componentTag: ComponentTag<T>): boolean {
    return this.components.has(componentTag.__tag);
  }

  /**
   * Deletes a component from the store.
   * @param componentTag - The tag of the component.
   */
  delete<T>(componentTag: ComponentTag<T>): void {
    this.components.delete(componentTag.__tag);
  }

  /**
   * Updates a component in the store using an updater function.
   * @param componentTag - The tag of the component.
   * @param updater A function that takes the current component (or undefined) and returns the updated component.
   */
  update<T>(componentTag: ComponentTag<T>, updater: (component: T) => T): void {
    const current = this.get(componentTag);
    if (current === undefined) {
      throw new Error(
        `Cannot update component that does not exist: ${componentTag.__tag}`,
      );
    }
    this.set(componentTag, updater(current));
  }
}
