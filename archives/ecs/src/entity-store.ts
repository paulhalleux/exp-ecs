import { ComponentStore } from "./component-store";
import { Entity } from "./entity";
import { Query } from "./query";
import { ComponentTag } from "./component";

type Subscription = {
  entity: Entity | null;
  query: Query;
  callback: (entities: Entity[]) => void;
};

/**
 * Manages entities and their associated ComponentStores.
 */
export class EntityStore {
  private nextEntityId: Entity = 1;
  private entities: Map<Entity, ComponentStore> = new Map();

  private readonly entitiesToRemove: Set<Entity> = new Set();
  private readonly subscribers: Set<Subscription> = new Set();

  /**
   * Creates a new entity and returns its unique identifier.
   * @return {number} The unique identifier of the created entity.
   */
  createEntity(cb?: (components: ComponentStore) => void): number {
    const id = this.nextEntityId++;
    const cs = new ComponentStore(this.notifySubscribers.bind(this, id));
    if (cb) cb(cs);
    this.entities.set(id, cs);
    this.notifySubscribers(id, null);
    return id;
  }

  /**
   * Destroys the entity with the given identifier.
   * @param {number} entityId - The unique identifier of the entity to be destroyed.
   */
  destroyEntity(entityId: number): void {
    this.entitiesToRemove.add(entityId);
  }

  /**
   * Cleans up entities that have been marked for removal.
   */
  cleanupEntities(): void {
    for (const entityId of this.entitiesToRemove) {
      this.entities.delete(entityId);
    }
    this.entitiesToRemove.clear();
    this.notifySubscribers(null, null);
  }

  /**
   * Retrieves the ComponentStore associated with the given entity ID.
   * @param {number} entityId - The unique identifier of the entity.
   * @return {ComponentStore | undefined} The ComponentStore of the entity, or undefined if not found.
   */
  get(entityId: number): ComponentStore | undefined {
    return this.entities.get(entityId);
  }

  /**
   * Retrieves the ComponentStores for a list of entity IDs.
   * @param {Entity[]} entityIds - The list of entity IDs.
   * @return {ComponentStore[]} An array of ComponentStores corresponding to the given entity IDs.
   */
  getAll(entityIds: Entity[]): ComponentStore[] {
    const stores: ComponentStore[] = [];
    for (const id of entityIds) {
      const store = this.entities.get(id);
      if (store) {
        stores.push(store);
      }
    }
    return stores;
  }

  /**
   * Finds all entities that have the specified component tag.
   * @param {ComponentTag<any>} tag - The component tag to search for.
   * @return {Entity[]} An array of entity IDs that have the specified component.
   */
  findAllWith(tag: ComponentTag<any>): Entity[] {
    const result: Entity[] = [];
    for (const [entityId, store] of this.entities) {
      if (store.has(tag)) {
        result.push(entityId);
      }
    }
    return result;
  }

  /**
   * Retrieves the internal map of entities to their ComponentStores.
   * @return {Map<number, ComponentStore>} The map of entity IDs to ComponentStores.
   */
  asMap(): Map<number, ComponentStore> {
    return this.entities;
  }

  /**
   * Subscribes to changes in entities matching the given query.
   * @param {Query} query - The query to match entities against.
   * @param {(entities: Entity[]) => void} callback - The callback to invoke when matching entities change.
   * @return {() => void} A function to unsubscribe from the query.
   */
  subscribe(query: Query, callback: (entities: Entity[]) => void): () => void {
    const subscription: Subscription = { query, callback, entity: null };
    this.subscribers.add(subscription);
    return () => {
      this.subscribers.delete(subscription);
    };
  }

  /**
   * Subscribes to changes for a specific entity matching the given query.
   * @param {Entity} entity - The specific entity to monitor.
   * @param {Query} query - The query to match the entity against.
   * @param {() => void} callback - The callback to invoke when the entity changes.
   * @return {() => void} A function to unsubscribe from the entity query.
   */
  subscribeTo(entity: Entity, query: Query, callback: () => void): () => void {
    const subscription: Subscription = { entity, query, callback };
    this.subscribers.add(subscription);
    return () => {
      this.subscribers.delete(subscription);
    };
  }

  /**
   * Notifies all subscribers of changes to matching entities.
   */
  notifySubscribers(
    entityId: number | null,
    componentTag: ComponentTag<any> | null,
  ): void {
    for (const sub of this.subscribers) {
      // ignore if this subscriber only cares about a single entity
      if (sub.entity !== null && sub.entity !== entityId) continue;

      // check if changed component is relevant to this query
      if (componentTag !== null) {
        const relevantTags = sub.query.getComponentTags();
        if (!relevantTags.has(componentTag)) continue;
      }

      // execute callback
      if (sub.entity !== null && entityId !== null) {
        if (sub.query.matchesEntity(this, entityId)) {
          sub.callback([entityId]);
        } else {
          sub.callback([]); // entity no longer matches
        }
      } else {
        // global query
        sub.callback(sub.query.execute(this));
      }
    }
  }
}
