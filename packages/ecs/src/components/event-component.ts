import { ComponentType, createComponentType } from "./index";

/**
 * Defines an Event component type.
 * Event components are not stored persistently — they are used as typed keys for the engine's transient EventBus.
 * Emitting an event should be done with `engine.add(entity, eventType, payload)` which will enqueue
 * the event into the engine's per-frame event bus and dispatch to registered event systems.
 *
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
