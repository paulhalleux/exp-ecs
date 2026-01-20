import { ComponentType, createComponentType } from "./index";

/**
 * Defines a Data component type.
 * Data components store structured data associated with entities.
 * @param options Optional configuration for the Data component.
 * @returns A ComponentType representing the Data component.
 */
export function defineComponent<T extends object>(options?: {
  name?: string;
  immutable?: boolean;
  defaults?: T;
  validate?(value: T): void;
}): ComponentType<"data", T> {
  return createComponentType<"data", T>({
    ...options,
    kind: "data",
    lifetime: "persistent",
  });
}
