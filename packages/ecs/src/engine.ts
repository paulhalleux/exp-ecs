import { EntityStore } from "./entity-store";
import { SystemStore } from "./system-store";

export class Engine {
  public readonly entityStore: EntityStore = new EntityStore();
  public readonly systems: SystemStore = new SystemStore();

  private rafId: number | null = null;
  private lastTime: number = 0;

  /**
   * Starts the engine's main loop.
   */
  start(): void {
    if (this.rafId !== null) return; // Already running
    const loop = (time: number) => {
      this.update(time);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Stops the engine's main loop.
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Updates all systems in the engine.
   * @param time - The current time.
   */
  private update(time: number): void {
    if (!this.lastTime) this.lastTime = time;
    const delta = time - this.lastTime;
    this.lastTime = time;

    const systems = this.systems.getAllSystems();
    for (const system of systems) {
      if (system.isEnabled()) {
        const query = system.getQuery();
        const entities = query.execute(this.entityStore);
        entities.forEach((entity) => {
          const cs = this.entityStore.get(entity);
          if (!cs) return;
          system.execute(delta, this.entityStore, cs, entity);
        });
      }
    }

    // Clean up entities marked for removal
    this.entityStore.cleanupEntities();
  }
}
