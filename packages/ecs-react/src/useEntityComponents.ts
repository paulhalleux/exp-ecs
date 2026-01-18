import {
  type ComponentTag,
  type Entity,
  type EntityStore,
  Query,
} from "@ptl/ecs";
import { useEffect, useState } from "react";

export function useEntityComponents<
  C extends Record<string, ComponentTag<any>>,
  Result = {
    [K in keyof C]: C[K] extends ComponentTag<infer U> ? U : never;
  },
>(entity: Entity, store: EntityStore, components: C): Result {
  const query = Query.and(...Object.values(components));

  const getResult = (): Result => {
    const componentStore = store.get(entity);
    if (!componentStore) {
      throw new Error(`Entity ${entity} does not exist in the store.`);
    }

    const result: Partial<{
      [K in keyof C]: ComponentTag<any> extends ComponentTag<infer U>
        ? U
        : never;
    }> = {};

    for (const key in components) {
      const compTag = components[key];
      if (!compTag) {
        throw new Error(`Component tag for key "${key}" is undefined or null.`);
      }
      const comp = componentStore.get(compTag);
      if (comp !== undefined) {
        result[key] = comp as any;
      } else {
        throw new Error(
          `Entity ${entity} is missing component for key "${key}".`,
        );
      }
    }

    return result as Result;
  };

  const [result, setResult] = useState<Result>(() => {
    return getResult();
  });

  useEffect(() => {
    return store.subscribeTo(entity, query, () => {
      setResult((prevState) => {
        const newState = getResult();
        if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
          return newState;
        }
        return prevState;
      });
    });
  }, [store, entity, query]);

  return result;
}
