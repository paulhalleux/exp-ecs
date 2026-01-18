import { createComponent } from "@ptl/ecs";

export type Position = {
  x: number;
  y: number;
};

export const PositionComponent = createComponent<Position>("Position");
