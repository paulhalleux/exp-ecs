import {
  createTickQuerySystem,
  createTickSystem,
  type Entity,
  Query,
} from "@ptl/ecs";
import * as React from "react";
import { useComponent, useQuery } from "@ptl/ecs-react";
import { Color, engine, Position, Size, Velocity } from "./engine.ts";

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
  const rectangles = useQuery(Query.has(Size));

  const rafRef = React.useRef<number>(0);
  React.useEffect(() => {
    let last = performance.now();
    const tick = (time: number) => {
      engine.update(time - last);
      last = time;
      rafRef.current = requestAnimationFrame(tick);
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
      const entity = Array.from(engine.entities())[
        Math.floor(Math.random() * Array.from(engine.entities()).length)
      ];
      if (e.key === " ") {
        engine.replace(entity, Velocity, (p) => ({ x: p.x, y: -10 }));
        engine.replace(entity, Color, {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <button onClick={() => createRect()} style={{ margin: 16 }}>
        Add Rectangle
      </button>
      {rectangles.map((entity) => {
        return <Rectangle key={entity} entity={entity} />;
      })}
    </div>
  );
}

const Rectangle = ({ entity }: { entity: Entity }) => {
  const size = useComponent(entity, Size);
  const color = useComponent(entity, Color);
  const position = useComponent(entity, Position);

  if (!size || !color || !position) {
    return null;
  }

  return (
    <div
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
};
