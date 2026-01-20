import { TickSystem } from "./tick-system";
import { StartupSystem } from "./startup-system";
import { CleanupSystem } from "./cleanup-system";
import { EventSystem } from "./event-system";
import { QuerySystem } from "./query-system";
import { TickQuerySystem } from "./tick-query-system";

/**
 * A base type for systems, combining a type identifier with a specific API.
 * @template Kind The type identifier for the system.
 * @template Api The specific API for the system.
 */
export type SystemBase<Kind, Api> = {
  __kind: Kind;
} & Api;

export type System =
  | StartupSystem
  | CleanupSystem
  | TickSystem
  | EventSystem<any>
  | QuerySystem
  | TickQuerySystem;

export { createTickSystem } from "./tick-system";
export { createStartupSystem } from "./startup-system";
export { createCleanupSystem } from "./cleanup-system";
export { createEventSystem } from "./event-system";
export { createQuerySystem } from "./query-system";
export { createTickQuerySystem } from "./tick-query-system";
