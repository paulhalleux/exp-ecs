import { createComponent } from "@ptl/ecs";

export type Rectangle = {
  width: number;
  height: number;
  color: string;
};

export const RectangleComponent = createComponent<Rectangle>("Rectangle");
