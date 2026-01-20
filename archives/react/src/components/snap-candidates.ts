import { createComponent, type Entity } from "@ptl/ecs";

export type SnapCandidate = {
  axis: "x" | "y";
  position: number;
  distance: number;
  target: Entity;
};

export const SnapCandidatesComponent =
  createComponent<SnapCandidate[]>("SnapCandidates");
