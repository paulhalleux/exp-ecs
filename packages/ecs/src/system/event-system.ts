import { Engine } from "../engine";
import { SystemBase } from "./index";
import { Entity } from "../entity";
import { BaseComponent, ComponentType } from "../components";

/**
 * A system that performs actions on each tick of the engine.
 */
export type EventSystem<T extends ComponentType<"event", any>> = SystemBase<
  "event",
  {
    componentType: T;
    handle: (
      engine: Engine,
      entity: Entity,
      event: T extends ComponentType<"event", infer D>
        ? BaseComponent<"event", D>
        : never,
    ) => void;
  }
>;

/**
 * Creates an EventSystem with the provided handle function.
 * @param componentType The component type that this event system will handle.
 * @param handleFn The function to be called when an event is dispatched.
 * @returns An EventSystem instance.
 */
export const createEventSystem = <T extends ComponentType<"event", any>>(
  componentType: T,
  handleFn: EventSystem<T>["handle"],
): EventSystem<T> => {
  return {
    __kind: "event",
    handle: handleFn,
    componentType,
  };
};
