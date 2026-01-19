import { createTickSystem, defineComponent, Engine } from "@ptl/ecs2";
import * as React from "react";
import { useState } from "react";

const engine = new Engine();

const Size = defineComponent({
  name: "Size",
  defaults: {
    width: 100,
    height: 100,
  },
});

const Color = defineComponent({
  name: "Color",
  defaults: {
    r: 255,
    g: 0,
    b: 0,
  },
});

const Position = defineComponent({
  name: "Position",
  defaults: {
    x: 0,
    y: 0,
  },
});

const createRect = () => {
  const entity = engine.createEntity();
  engine.add(entity, Size);
  engine.add(entity, Color, {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });
  engine.add(entity, Position);
};

createRect();

const MoveSystem = createTickSystem((engine, dt) => {
  for (const entity of engine.entities()) {
    const position = engine.safeGet(entity, Position);
    if (!position) continue;
    engine.replace(entity, Position, {
      x: (position.x + dt) % (window.innerWidth - 100),
      y: position.y,
    });
  }
});

engine.addSystem(MoveSystem);

export function App() {
  const [, setR] = useState(0);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    let last = performance.now();
    const tick = (time: number) => {
      engine.update(time - last);
      last = time;
      rafRef.current = requestAnimationFrame(tick);
      setR((r) => (r + 1) % 256);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {Array.from(engine.entities()).map((entity) => {
        const size = engine.safeGet(entity, Size);
        const color = engine.safeGet(entity, Color);
        const position = engine.safeGet(entity, Position);

        return (
          <div
            key={entity}
            style={{
              width: size.width,
              height: size.height,
              backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
              position: "absolute",
              left: position.x,
              top: position.y,
            }}
          />
        );
      })}
    </div>
  );
}
