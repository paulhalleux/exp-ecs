import { createComponent, type Entity } from "@ptl/ecs";

export type Pointer = {
  x: number;
  y: number;
  down: boolean;
  targetEntity: Entity | undefined;
};

export const PointerComponent = createComponent<Pointer>("Pointer");
