import { defineComponent, Engine } from "@ptl/ecs";

export const engine = new Engine();

export const Size = defineComponent({
  name: "Size",
  defaults: {
    width: 100,
    height: 100,
  },
});

export const Color = defineComponent({
  name: "Color",
  defaults: {
    r: 255,
    g: 0,
    b: 0,
  },
});

export const Position = defineComponent({
  name: "Position",
  defaults: {
    x: 0,
    y: 0,
  },
});

export const Velocity = defineComponent({
  name: "Velocity",
  defaults: {
    x: 0,
    y: 0,
  },
});
