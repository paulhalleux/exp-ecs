import { Entity } from "./entity";

export type EventPayload = { entity: Entity; data: any };

/**
 * Transient per-engine, per-frame event bus.
 * Events are queued via `emit` and drained via `drainAll`.
 */
export class EventBus {
  private readonly events = new Map<symbol, EventPayload[]>();

  emit<T>(key: symbol, entity: Entity, data: T): void {
    let list = this.events.get(key);
    if (!list) {
      list = [];
      this.events.set(key, list);
    }
    list.push({ entity, data });
  }

  get(key: symbol): ReadonlyArray<EventPayload> | undefined {
    return this.events.get(key);
  }

  drain(key: symbol): EventPayload[] {
    const list = this.events.get(key) ?? [];
    this.events.delete(key);
    return list;
  }

  drainAll(): Map<symbol, EventPayload[]> {
    const out = new Map(this.events);
    this.events.clear();
    return out;
  }

  clear(): void {
    this.events.clear();
  }
}
