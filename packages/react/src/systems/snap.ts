import {
  ComponentStore,
  type Entity,
  EntityStore,
  Query,
  System,
} from "@ptl/ecs";
import { DraggingComponent } from "../components/dragging.ts";
import { SnapTargetComponent } from "../components/snap-target.ts";
import { PositionComponent } from "../components/position.ts";
import {
  type SnapCandidate,
  SnapCandidatesComponent,
} from "../components/snap-candidates.ts";
import { SnapStateComponent } from "../components/snap-state.ts";
import { RectangleComponent } from "../components/rectangle.ts";

export class SnapSystem extends System {
  SNAP_DISTANCE = 8;

  constructor() {
    super("SnapSystem");
  }

  getQuery() {
    return Query.and(PositionComponent, DraggingComponent);
  }

  execute(_: number, store: EntityStore, cs: ComponentStore, entity: Entity) {
    const transform = cs.safeGet(PositionComponent);

    const candidates: SnapCandidate[] = [];

    for (const [other, otherCS] of store.asMap()) {
      if (other === entity) continue;
      if (!otherCS.has(SnapTargetComponent)) continue;

      const otherTransform = otherCS.get(PositionComponent);
      const otherRect = otherCS.get(RectangleComponent);
      if (!otherTransform || !otherRect) continue;

      const dx = Math.abs(transform.x - otherTransform.x);
      if (dx < this.SNAP_DISTANCE) {
        candidates.push({
          axis: "x",
          position: otherTransform.x,
          distance: dx,
          target: other,
        });
      }

      const dy = Math.abs(transform.y - otherTransform.y);
      if (dy < this.SNAP_DISTANCE) {
        candidates.push({
          axis: "y",
          position: otherTransform.y,
          distance: dy,
          target: other,
        });
      }

      // edge snapping, when two edges are close enough
      const widthA = cs.get(RectangleComponent)?.width || 0;
      const heightA = cs.get(RectangleComponent)?.height || 0;
      const widthB = otherRect.width;
      const heightB = otherRect.height;

      const leftA = transform.x;
      const rightA = transform.x + widthA;
      const topA = transform.y;
      const bottomA = transform.y + heightA;

      const leftB = otherTransform.x;
      const rightB = otherTransform.x + widthB;
      const topB = otherTransform.y;
      const bottomB = otherTransform.y + heightB;

      const edgeSnaps = [
        { dist: Math.abs(leftA - rightB), pos: rightB, axis: "x" }, // leftA → rightB
        { dist: Math.abs(rightA - leftB), pos: leftB - widthA, axis: "x" }, // rightA → leftB
        { dist: Math.abs(topA - bottomB), pos: bottomB, axis: "y" }, // topA → bottomB
        { dist: Math.abs(bottomA - topB), pos: topB - heightA, axis: "y" }, // bottomA → topB
      ];

      for (const snap of edgeSnaps) {
        if (snap.dist < this.SNAP_DISTANCE) {
          candidates.push({
            axis: snap.axis as "x" | "y",
            position: snap.pos,
            distance: snap.dist,
            target: other,
          });
        }
      }
    }

    cs.set(SnapCandidatesComponent, candidates);

    const bestX = candidates
      .filter((c) => c.axis === "x")
      .sort((a, b) => a.distance - b.distance)[0];

    const bestY = candidates
      .filter((c) => c.axis === "y")
      .sort((a, b) => a.distance - b.distance)[0];

    if (bestX || bestY) {
      cs.set(SnapStateComponent, {
        x: bestX?.position,
        y: bestY?.position,
      });

      cs.update(PositionComponent, (t) => ({
        ...t,
        x: bestX?.position ?? t.x,
        y: bestY?.position ?? t.y,
      }));
    } else {
      cs.delete(SnapStateComponent);
    }
  }
}
