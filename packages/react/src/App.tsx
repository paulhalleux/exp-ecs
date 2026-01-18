import { Engine, EntityStore, Query } from "@ptl/ecs";
import * as React from "react";
import { createPointerEntity } from "./entities/pointer.ts";
import { type Rectangle, RectangleComponent } from "./components/rectangle.ts";
import { PositionComponent } from "./components/position.ts";
import { DragSystem } from "./systems/drag.ts";
import { RenderRectangleSystem } from "./systems/render-rectangle.ts";
import { PointerComponent } from "./components/pointer.ts";
import { DraggingComponent } from "./components/dragging.ts";
import { Renderable2DComponent } from "./components/2d-renderable.ts";
import { useEntityComponents, useQueryEntities } from "@ptl/ecs-react";
import { SnapTargetComponent } from "./components/snap-target.ts";
import { SnapSystem } from "./systems/snap.ts";
import { SnapGuideComponent } from "./components/snap-guides.ts";
import { SnapGuideSystem } from "./systems/snap-guide.ts";

const engine = new Engine();
const pointerEntity = createPointerEntity(engine.entityStore);

const createRectangleEntity = (props: Rectangle) => {
  return engine.entityStore.createEntity((components) => {
    components.set(RectangleComponent, props);
    components.set(PositionComponent, { x: 0, y: 0 });
    components.set(SnapTargetComponent, { edges: [] });
    components.set(Renderable2DComponent, {
      width: props.width,
      height: props.height,
      color: props.color,
      left: 0,
      top: 0,
    });
  });
};

engine.systems.addSystem(new DragSystem(pointerEntity));
engine.systems.addSystem(new SnapSystem());
engine.systems.addSystem(new SnapGuideSystem());
engine.systems.addSystem(new RenderRectangleSystem());

function installPointerBridge(store: EntityStore) {
  const cs = store.get(pointerEntity)!;

  window.addEventListener("pointermove", (e) => {
    cs.update(PointerComponent, (p) => ({
      ...p,
      x: e.clientX,
      y: e.clientY,
    }));
  });

  window.addEventListener("pointerup", () => {
    cs.update(PointerComponent, (p) => ({
      ...p,
      down: false,
      target: undefined,
    }));
  });
}

installPointerBridge(engine.entityStore);
engine.start();

export function App() {
  const rectangles = useQueryEntities(engine.entityStore, RectangleComponent);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div>
        <button onClick={() => engine.start()}>Start Engine</button>
        <button onClick={() => engine.stop()}>Stop Engine</button>
        <button
          onClick={() =>
            createRectangleEntity({
              width: 100,
              height: 100,
              color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            })
          }
        >
          Add Rectangle
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {rectangles.map((entity) => (
          <RenderRectangle key={entity} entity={entity} />
        ))}
        <SnapGuidesLayer />
      </div>
    </div>
  );
}

const RenderRectangle: React.FC<{ entity: number }> = ({ entity }) => {
  const { renderable } = useEntityComponents(entity, engine.entityStore, {
    renderable: Renderable2DComponent,
  });

  const style: React.CSSProperties = {
    position: "absolute",
    width: renderable.width,
    height: renderable.height,
    backgroundColor: renderable.color,
    left: renderable.left,
    top: renderable.top,
  };

  React.useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "pointerup",
      () => {
        engine.entityStore
          .get(pointerEntity)!
          .update(PointerComponent, (p) => ({
            ...p,
            down: false,
          }));

        for (const [, cs] of engine.entityStore.asMap()) {
          if (cs.has(DraggingComponent)) cs.delete(DraggingComponent);
        }
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div
      onPointerDown={(e) => {
        const store = engine.entityStore;
        const cs = store.get(entity)!;
        const pos = cs.get(PositionComponent)!;

        store.get(pointerEntity)!.update(PointerComponent, (p) => ({
          ...p,
          down: true,
          target: entity,
        }));

        cs.set(DraggingComponent, {
          offsetX: e.clientX - pos.x,
          offsetY: e.clientY - pos.y,
        });
      }}
      style={style}
    />
  );
};

const SnapGuidesLayer = () => {
  const entities = useQueryEntities(
    engine.entityStore,
    Query.and(SnapGuideComponent, DraggingComponent),
  );

  return (
    <>
      {entities.map((entity) => {
        return <SnapGuides key={entity} entity={entity} />;
      })}
    </>
  );
};

const SnapGuides = ({ entity }: { entity: number }) => {
  const { guides } = useEntityComponents(entity, engine.entityStore, {
    guides: SnapGuideComponent,
  });

  return guides.map((guide, i) =>
    guide.axis === "x" ? (
      <div
        key={`${entity}-x-${i}`}
        style={{
          position: "absolute",
          left: guide.position,
          top: 0,
          bottom: 0,
          width: 1,
          background: "red",
          pointerEvents: "none",
        }}
      />
    ) : (
      <div
        key={`${entity}-y-${i}`}
        style={{
          position: "absolute",
          top: guide.position,
          left: 0,
          right: 0,
          height: 1,
          background: "red",
          pointerEvents: "none",
        }}
      />
    ),
  );
};
