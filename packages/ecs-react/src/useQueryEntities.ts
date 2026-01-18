import {
  type ComponentTag,
  type Entity,
  type EntityStore,
  Query,
} from "@ptl/ecs";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQueryEntities(store: EntityStore, query: Query | ComponentTag<any>) {
  const q = Query.has(query);
  const [entities, setEntities] = useState<Entity[]>(() => q.execute(store));

  useEffect(() => {
    return store.subscribe(q, (entities) => {
      setEntities((prevState) => {
        if (
          prevState.length === entities.length &&
          prevState.every((v, i) => v === entities[i])
        ) {
          return prevState; // no change
        }
        return entities;
      });
    });
  }, [store, query, q]);

  return entities;
}
