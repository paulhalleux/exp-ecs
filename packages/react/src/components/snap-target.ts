import { createComponent } from "@ptl/ecs";

export type SnapTarget = {
  edges: ("top" | "bottom" | "left" | "right" | "centerX" | "centerY")[];
};

export const SnapTargetComponent = createComponent<SnapTarget>("SnapTarget");
