/**
 * Phantom-typed component tag
 * @template T The type of the component data.
 */
export type ComponentTag<T> = {
  readonly __tag: string;
};

/**
 * Creates a new component tag with the given name.
 *
 * Component tags allow associating data of type T with entities in an ECS architecture.
 * They serve as unique identifiers for different component types and allow type-safe access to component data.
 *
 * @param {string} name - The name of the component.
 * @return The created component tag.
 */
export function createComponent<T>(name: string): ComponentTag<T> {
  return { __tag: name } as ComponentTag<T>;
}
