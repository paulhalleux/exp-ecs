import { System } from "./system";
import { Entity } from "./entity";
import {
  BaseComponent,
  ComponentKind,
  ComponentStore,
  ComponentType,
  isEventComponentType,
} from "./components";
import { EventSystem } from "./system/event-system";
import { QuerySystem } from "./system/query-system";
import { QueryComponent, QueryTracker } from "./query";
import { TickQuerySystem } from "./system/tick-query-system";
import { EventBus } from "./event-bus";

export class Engine {
  private systems: System[] = [];
  private readonly eventSystems = new Map<symbol, EventSystem<any>[]>();
  private readonly querySystems = new Map<QuerySystem, QueryTracker>();
  private readonly tickQuerySystems = new Map<TickQuerySystem, QueryTracker>();
  private systemsRemovalQueue: System[] = [];

  private queryTrackers = new Map<string, QueryTracker>();

  private nextEntityId: Entity = 1;
  private readonly entitySet: Set<Entity> = new Set();
  private entitiesRemovalQueue: Entity[] = [];

  private readonly componentStores = new Map<symbol, ComponentStore<any>>();

  // Transient event bus for the engine
  private readonly eventBus = new EventBus();

  // ------------------------------------------
  // Entity Management
  // ------------------------------------------

  /**
   * Creates a new entity in the engine.
   * @returns The ID of the newly created entity.
   */
  createEntity(): Entity {
    const entity = this.nextEntityId++;
    this.entitySet.add(entity);
    return entity;
  }

  /**
   * Requests the removal of an entity from the engine.
   *
   * This method queues the entity for removal,
   * which will be processed after the current update cycle.
   *
   * @param entity The entity to remove.
   */
  requestEntityRemoval(entity: Entity): void {
    this.entitiesRemovalQueue.push(entity);
  }

  /**
   * Processes the removal of entities queued for deletion.
   *
   * This method is called after the update cycle to ensure
   * that entities are not removed while systems are iterating over them.
   */
  processEntityRemovals(): void {
    for (const entityToRemove of this.entitiesRemovalQueue) {
      this.entitySet.delete(entityToRemove);
    }
    this.entitiesRemovalQueue = [];
  }

  // ------------------------------------------
  // Component Store Management
  // ------------------------------------------

  /**
   * Registers a component type with the engine.
   * @param type The component type to register.
   */
  registerComponent<Kind extends ComponentKind, Data>(
    type: ComponentType<Kind, Data>,
  ): void {
    // Don't register event component types as persistent stores; they are transient via EventBus
    if (isEventComponentType(type)) {
      return;
    }

    if (this.componentStores.has(type.key)) {
      return;
    }

    this.componentStores.set(
      type.key,
      new ComponentStore<BaseComponent<Kind, Data>>(type.lifetime),
    );
  }

  // ------------------------------------------
  // Entity Component Management
  // ------------------------------------------

  /**
   * Checks if an entity has a specific component.
   * @param entity The entity to check.
   * @param type The component type to check for.
   * @returns True if the entity has the component, false otherwise.
   */
  has<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
  ): boolean {
    this.assertEntity(entity);
    const store = this.componentStores.get(type.key);
    if (!store) {
      return false;
    }
    return store.has(entity);
  }

  /**
   * Gets the component data for a specific entity and component type.
   * @param entity The entity to get the component for.
   * @param type The component type to get.
   * @returns The component data, or undefined if the entity does not have the component.
   */
  get<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
  ): Readonly<Data> | undefined {
    this.assertEntity(entity);
    const store = this.componentStores.get(type.key);
    if (!store) {
      return undefined;
    }
    return store.get(entity);
  }

  /**
   * Safely gets the component data for a specific entity and component type.
   * Throws an error if the entity does not have the component.
   * @param entity The entity to get the component for.
   * @param type The component type to get.
   * @returns The component data.
   * @throws Error if the entity does not have the component.
   */
  safeGet<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
  ): Readonly<Data> {
    this.assertEntity(entity);
    const store = this.componentStores.get(type.key);
    if (!store) {
      throw new Error(
        `Component type ${type.name} is not registered in the engine.`,
      );
    }
    const component = store.get(entity);
    if (!component) {
      throw new Error(
        `Entity ${entity} does not have component of type ${type.name}.`,
      );
    }
    return component;
  }

  /**
   * Adds or updates a component for a specific entity.
   * @param entity The entity to add or update the component for.
   * @param type The component type to add or update.
   * @param data The component data to set.
   */
  add<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
    data?: Partial<Data>,
  ): void {
    this.assertEntity(entity);

    // If the component is an event, emit it to the event bus instead of storing
    if (isEventComponentType(type)) {
      const component = type.create(data) as BaseComponent<"event", Data>;
      type.validate?.(component as any);
      // Use the component type key as the event key
      this.eventBus.emit(type.key, entity, component as any);

      // Update queries in case any query depends on event components (unlikely)
      this.updateQueries(entity);
      return;
    }

    let store = this.componentStores.get(type.key);
    if (!store) {
      this.registerComponent(type);
    }
    store = this.componentStores.get(type.key)!;

    const component = type.create(data);
    type.validate?.(component);
    store.set(entity, component);

    this.updateQueries(entity);
  }

  /**
   * Removes a component from a specific entity.
   * @param entity The entity to remove the component from.
   * @param type The component type to remove.
   */
  remove<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
  ): void {
    const store = this.componentStores.get(type.key);
    if (!store) {
      return;
    }
    store.delete(entity);
    this.updateQueries(entity);
  }

  /**
   * Replaces a component's data for a specific entity using an updater function.
   * @param entity The entity whose component data is to be replaced.
   * @param type The component type whose data is to be replaced.
   * @param data The new component data to set.
   */
  replace<Kind extends ComponentKind, Data>(
    entity: Entity,
    type: ComponentType<Kind, Data>,
    data: ((oldData: Readonly<Data>) => Data) | Data,
  ): void {
    this.assertEntity(entity);
    if (type.immutable) {
      throw new Error(
        `Component "${type.name}" is immutable and cannot be replaced`,
      );
    }

    const componentStore = this.componentStores.get(type.key);
    if (!componentStore) {
      throw new Error(
        `Component type "${type.name}" is not registered in the engine.`,
      );
    }

    componentStore.replace(entity, data);

    this.updateQueries(entity);
  }

  /**
   * Retrieves the component store for a specific component type.
   * @param type The component type to get the store for.
   * @returns The component store for the specified component type.
   */
  getComponentStore<Kind extends ComponentKind, Data>(
    type: ComponentType<Kind, Data>,
  ): ComponentStore<BaseComponent<Kind, Data>> {
    let store = this.componentStores.get(type.key);
    if (!store) {
      this.registerComponent(type);
    }
    store = this.componentStores.get(type.key)!;
    return store;
  }

  /**
   * Processes frame-lifetime components by clearing them from their stores.
   */
  processFrameComponents(): void {
    for (const [_, store] of this.componentStores) {
      if (store.lifetime === "frame") {
        store.clear();
      }
    }
  }

  // ------------------------------------------
  // System Management
  // ------------------------------------------

  /**
   * Adds a system to the engine.
   * @param system The system to add.
   */
  addSystem(system: System): void {
    if (this.systems.includes(system)) {
      return;
    }

    // Handle event systems separately
    if (system.__kind === "event") {
      const eventTypeKey = system.componentType.key;
      if (!this.eventSystems.has(eventTypeKey)) {
        this.eventSystems.set(eventTypeKey, []);
      }
      this.eventSystems.get(eventTypeKey)!.push(system);
    } else if (system.__kind === "query") {
      if (this.querySystems.has(system)) {
        return;
      }
      const tracker = new QueryTracker(this, system.query);
      this.querySystems.set(system, tracker);
    } else if (system.__kind === "tick-query") {
      if (this.tickQuerySystems.has(system)) {
        return;
      }
      const tracker = new QueryTracker(this, system.query);
      this.tickQuerySystems.set(system, tracker);
    } else {
      // Regular systems
      this.systems.push(system);
    }
  }

  /**
   * Requests the removal of a system from the engine.
   *
   * This method queues the system for removal,
   * which will be processed after the current update cycle.
   *
   * @param system The system to remove.
   */
  requestSystemRemoval(system: System): void {
    this.systemsRemovalQueue.push(system);
  }

  /**
   * Processes the removal of systems queued for deletion.
   *
   * This method is called after the update cycle to ensure
   * that systems are not removed while they are being executed.
   */
  processSystemRemovals(): void {
    for (const systemToRemove of this.systemsRemovalQueue) {
      this.systems = this.systems.filter((system) => system !== systemToRemove);
    }
    this.systemsRemovalQueue = [];
  }

  /**
   * Dispatch all queued events from the event bus to the registered event systems.
   */
  private dispatchQueuedEvents(): void {
    const all = this.eventBus.drainAll();
    for (const [key, list] of all.entries()) {
      const systems = this.eventSystems.get(key);
      if (!systems) continue;
      for (const payload of list) {
        for (const system of systems) {
          system.handle(this, payload.entity, payload.data);
        }
      }
    }
  }

  /**
   * Updates all query systems with the given entity.
   * @param entity The entity to update in the query systems.
   */
  private updateQueries(entity: Entity): void {
    for (const [system, tracker] of this.querySystems) {
      const result = tracker.update(entity);

      if (result === "enter") {
        system.onEnter?.(this, entity);
      }

      if (result === "update") {
        system.onUpdate?.(this, entity);
      }

      if (result === "exit") {
        system.onExit?.(this, entity);
      }
    }

    for (const [, tracker] of this.tickQuerySystems) {
      tracker.update(entity);
    }

    for (const [, tracker] of this.queryTrackers) {
      tracker.update(entity);
    }
  }

  /**
   * Retrieves a QueryTracker for the specified query.
   * If a tracker for the query does not exist, it creates a new one.
   * @param query The query component defining the criteria for the tracker.
   * @returns The QueryTracker associated with the query.
   */
  getQueryTracker(query: QueryComponent): QueryTracker {
    const key = JSON.stringify(query, (_, v) =>
      typeof v === "symbol" ? v.toString() : v,
    );

    let tracker = this.queryTrackers.get(key);
    if (!tracker) {
      tracker = new QueryTracker(this, query);
      this.queryTrackers.set(key, tracker);
    }

    return tracker;
  }

  // ------------------------------------------
  // Lifecycle Methods
  // ------------------------------------------

  /**
   * Updates the engine by running all tick systems.
   * @param deltaTime The time elapsed since the last update.
   */
  update(deltaTime: number): void {
    // Dispatch transient events for this frame before running tick systems
    this.dispatchQueuedEvents();

    const tickSystems = this.getSystemsByKind("tick");
    for (const system of tickSystems) {
      system.tick(this, deltaTime);
    }

    for (const [system, tracker] of this.tickQuerySystems.entries()) {
      for (const entity of tracker.all()) {
        system.tick(this, entity, deltaTime);
      }
    }

    // Process removals after all systems have run
    // to avoid modifying the systems/entities list during iteration.
    this.processSystemRemovals();
    this.processEntityRemovals();
    this.processFrameComponents();
  }

  /**
   * Initializes the engine by running all startup systems.
   */
  startup(): void {
    const startupSystems = this.getSystemsByKind("startup");
    for (const system of startupSystems) {
      system.run(this);
    }
  }

  /**
   * Cleans up the engine by running all cleanup systems.
   */
  cleanup(): void {
    const cleanupSystems = this.getSystemsByKind("cleanup");
    for (const system of cleanupSystems) {
      system.run(this);
    }
  }

  /**
   * Returns an iterable of all entities in the engine.
   * @returns An iterable of entities.
   */
  *entities(): Iterable<Entity> {
    for (const entity of this.entitySet) {
      yield entity;
    }
  }

  // ------------------------------------------
  // Private Methods
  // ------------------------------------------

  private getSystemsByKind<T extends System["__kind"]>(
    kind: T,
  ): Extract<System, { __kind: T }>[] {
    return this.systems.filter(
      (system): system is Extract<System, { __kind: T }> =>
        system.__kind === kind,
    );
  }

  private assertEntity(entity: Entity): void {
    if (!this.entitySet.has(entity)) {
      throw new Error(`Entity ${entity} does not exist`);
    }
  }
}
