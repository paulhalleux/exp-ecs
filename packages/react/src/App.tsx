import {
  createTickQuerySystem,
  createTickSystem,
  defineComponent,
  Engine,
  Query,
} from "@ptl/ecs";
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

const Velocity = defineComponent({
  name: "Velocity",
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
  engine.add(entity, Position, {
    x: 0,
    y: window.innerHeight - 100,
  });
  engine.add(entity, Velocity, {
    x: 8,
    y: 0,
  });
};

createRect();

const MoveSystem = createTickSystem((engine) => {
  for (const entity of engine.entities()) {
    const position = engine.safeGet(entity, Position);
    const velocity = engine.safeGet(entity, Velocity);
    if (!position || !velocity) continue;
    const maxX = window.innerWidth - 100;

    // update velocity to bounce off walls
    if (position.x + velocity.x >= maxX || position.x + velocity.x <= 0) {
      engine.replace(entity, Velocity, {
        x: -velocity.x,
        y: velocity.y,
      });
    } else {
      engine.replace(entity, Position, {
        x: (position.x + velocity.x) % maxX,
        y: Math.max(position.y + velocity.y, 0),
      });
    }
  }
});

const GravitySystem = createTickQuerySystem(
  Query.has(Velocity),
  (engine, entity, delta) => {
    const velocity = engine.safeGet(entity, Velocity);
    engine.replace(entity, Velocity, {
      x: velocity.x,
      y: velocity.y + 0.5 * (delta / 16.67), // approximate gravity
    });
    const position = engine.safeGet(entity, Position);
    if (position.y >= window.innerHeight - 100) {
      engine.replace(entity, Position, {
        x: position.x,
        y: window.innerHeight - 100,
      });
      engine.replace(entity, Velocity, {
        x: velocity.x,
        y: 0,
      });
    }
  },
);

engine.addSystem(MoveSystem);
engine.addSystem(GravitySystem);

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

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const entity = Array.from(engine.entities())[0];
      if (e.key === " ") {
        engine.replace(entity, Velocity, (p) => ({ x: p.x, y: -10 }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

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
