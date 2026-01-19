import { ComponentType, createComponentType } from "./index";

/**
 * Defines an Event component type.
 * Event components are used to represent transient events that occur within a single frame.
 * @param options Optional configuration for the Event component.
 * @returns A ComponentType representing the Event component.
 */
export function defineEvent<T extends object>(options?: {
  name?: string;
  defaults?: T;
  validate?(value: T): void;
}): ComponentType<"event", T> {
  return createComponentType<"event", T>({
    ...options,
    kind: "event",
    lifetime: "frame",
  });
}
