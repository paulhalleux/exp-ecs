import { ComponentStore, EntityStore, Query, System } from "@ptl/ecs";
import { PositionComponent } from "../components/position.ts";
import { Renderable2DComponent } from "../components/2d-renderable.ts";
import { RectangleComponent } from "../components/rectangle.ts";
import { SnapStateComponent } from "../components/snap-state.ts";

export class RenderRectangleSystem extends System {
  constructor() {
    super("RenderRectangleSystem");
  }

  getQuery() {
    return Query.and(PositionComponent, RectangleComponent);
  }

  execute(_: number, __: EntityStore, cs: ComponentStore) {
    const pos = cs.safeGet(PositionComponent);
    const rect = cs.safeGet(RectangleComponent);
    const snapState = cs.get(SnapStateComponent);

    cs.set(Renderable2DComponent, {
      left: snapState?.x ?? pos.x,
      top: snapState?.y ?? pos.y,
      width: rect.width,
      height: rect.height,
      color: rect.color,
    });
  }
}
