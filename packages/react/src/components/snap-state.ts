import { createComponent } from "@ptl/ecs";

export type SnapState = {
  x?: number;
  y?: number;
};

export const SnapStateComponent = createComponent<SnapState>("SnapState");
