import { createComponent } from "@ptl/ecs";

export type Dragging = {
  offsetX: number;
  offsetY: number;
};

export const DraggingComponent = createComponent<Dragging>("Dragging");
