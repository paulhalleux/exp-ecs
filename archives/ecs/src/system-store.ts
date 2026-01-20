import { System } from "./system";

/**
 * Class representing a store for managing multiple systems.
 */
export class SystemStore {
  private systems: Map<string, System> = new Map();

  /**
   * Adds a system to the store.
   * @param {System} system - The system to add.
   */
  addSystem(system: System): void {
    this.systems.set(system.name, system);
  }

  /**
   * Retrieves a system by its name.
   * @param {string} name - The name of the system.
   * @return {System | undefined} The system if found, otherwise undefined.
   */
  getSystem(name: string): System | undefined {
    return this.systems.get(name);
  }

  /**
   * Removes a system from the store by its name.
   * @param {string} name - The name of the system to remove.
   */
  removeSystem(name: string): void {
    this.systems.delete(name);
  }

  /**
   * Retrieves all systems in the store.
   * @return {System[]} An array of all systems.
   */
  getAllSystems(): System[] {
    return Array.from(this.systems.values());
  }
}
