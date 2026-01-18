import { createComponent } from "@ptl/ecs";

export type SnapGuide = {
  axis: "x" | "y";
  position: number;
};

export const SnapGuideComponent = createComponent<SnapGuide[]>("SnapGuide");