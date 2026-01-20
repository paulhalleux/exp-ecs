import {
  ComponentStore,
  type Entity,
  EntityStore,
  Query,
  System,
} from "@ptl/ecs";
import { PositionComponent } from "../components/position.ts";
import { DraggingComponent } from "../components/dragging.ts";
import { PointerComponent } from "../components/pointer.ts";

export class DragSystem extends System {
  constructor(private readonly pointerEntity: Entity) {
    super("DragSystem");
  }

  getQuery(): Query {
    return Query.and(PositionComponent, DraggingComponent);
  }

  execute(_: number, entityStore: EntityStore, cs: ComponentStore): void {
    const pointer = entityStore.get(this.pointerEntity)?.get(PointerComponent);
    if (!pointer?.down) return;

    const dragging = cs.get(DraggingComponent);
    if (!dragging) return;

    cs.update(PositionComponent, () => ({
      x: pointer.x - dragging.offsetX,
      y: pointer.y - dragging.offsetY,
    }));
  }
}
