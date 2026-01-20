import { ComponentStore, EntityStore, Query, System } from "@ptl/ecs";
import { SnapCandidatesComponent } from "../components/snap-candidates.ts";
import { SnapGuideComponent } from "../components/snap-guides.ts";

export class SnapGuideSystem extends System {
  constructor() {
    super("SnapGuideSystem");
  }

  getQuery() {
    return Query.has(SnapCandidatesComponent);
  }

  execute(_: number, __: EntityStore, cs: ComponentStore) {
    const candidates = cs.safeGet(SnapCandidatesComponent);

    cs.set(
      SnapGuideComponent,
      candidates.map((c) => ({
        axis: c.axis,
        position: c.position,
      })),
    );
  }
}
