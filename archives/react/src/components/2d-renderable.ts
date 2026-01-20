import { createComponent } from "@ptl/ecs";

export type Renderable2D = {
  width: number;
  height: number;
  top: number;
  left: number;
  color: string;
};

export const Renderable2DComponent =
  createComponent<Renderable2D>("Renderable2D");
