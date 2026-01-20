import { type Entity, EntityStore } from "@ptl/ecs";
import { PointerComponent } from "../components/pointer.ts";

export const createPointerEntity = (entityStore: EntityStore): Entity => {
  return entityStore.createEntity((components) => {
    components.set(PointerComponent, {
      x: 0,
      y: 0,
      down: false,
      targetEntity: undefined,
    });
  });
};
