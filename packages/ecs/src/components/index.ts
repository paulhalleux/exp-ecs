/**
 * Defines the kinds of components available in the ECS.
 * - "data": Components that store data associated with entities.
 * - "tag": Marker components used to signify certain properties or states of entities. Does not store any data.
 * - "event": Components that represent events or actions that can occur within the ECS. Used to trigger behaviors or responses.
 */
export type ComponentKind = "data" | "tag" | "event";

/**
 * Defines the lifetime of components within the ECS.
 * - "persistent": Components that persist across multiple frames and are not automatically removed.
 * - "frame": Components that exist only for a single frame and are automatically removed at the end of the frame.
 * - "manual": Components that require explicit removal and do not follow automatic lifecycle management.
 */
export type ComponentLifetime = "persistent" | "frame" | "manual";

/**
 * The base interface for all components in the ECS.
 */
export type BaseComponent<Kind extends ComponentKind, Data> = {
  readonly __kind: Kind;
} & Data;

/**
 * The interface for defining component types in the ECS.
 *
 * @template T - The specific component type extending BaseComponent.
 */
export type ComponentType<
  Kind extends ComponentKind,
  Data,
  T = BaseComponent<Kind, Data>,
> = {
  readonly key: symbol;
  readonly kind: ComponentKind;
  readonly name: string;
  readonly lifetime: ComponentLifetime;
  readonly immutable: boolean;

  create(data?: Partial<Data>): T;
  validate?(component: Data): void;
};

/**
 * Options for creating a new component type.
 *
 * @template Kind - The kind of the component (data, tag, event).
 * @template T - The data structure of the component.
 */
type ComponentOptions<Kind extends ComponentKind, T extends object> = {
  name?: string;
  kind?: Kind;
  lifetime?: ComponentLifetime;
  immutable?: boolean;
  defaults?: T;
  validate?(value: T): void;
};

/**
 * Creates a new component type with the specified options.
 *
 * @template Kind - The kind of the component (data, tag, event).
 * @template T - The data structure of the component.
 * @param options - Configuration options for the component type.
 * @returns A new ComponentType instance.
 * @internal Internal use only. Use defineComponent, defineTag, or defineEvent instead.
 */
export function createComponentType<
  Kind extends ComponentKind,
  T extends object,
>(options: ComponentOptions<Kind, T> = {}): ComponentType<Kind, T> {
  const {
    name = "AnonymousComponent",
    kind = "data",
    lifetime = kind === "event" ? "frame" : "persistent",
    immutable = false,
    defaults,
    validate,
  } = options;

  const key = Symbol(name);
  return {
    key,
    kind,
    name,
    lifetime,
    immutable,
    validate,
    create(data) {
      const value = Object.assign({}, defaults ?? {}, data ?? {}, {
        __kind: kind,
      }) as BaseComponent<Kind, T>;

      validate?.(value as T);
      return value;
    },
  };
}

export { defineEvent } from "./event-component";
export { defineTag } from "./tag-component";
export { defineComponent } from "./data-component";
export { ComponentStore } from "./component-store";

export const isEventComponentType = <Data>(
  component: ComponentType<ComponentKind, Data>,
): component is ComponentType<"event", Data> => {
  return component.kind === "event";
};

export const isEventComponent = <Data>(
  component: BaseComponent<ComponentKind, Data>,
): component is BaseComponent<"event", Data> => {
  return component.__kind === "event";
};

export const isTagComponentType = (
  component: ComponentType<ComponentKind, {}>,
): component is ComponentType<"tag", {}> => {
  return component.kind === "tag";
};

export const isTagComponent = (
  component: BaseComponent<ComponentKind, {}>,
): component is BaseComponent<"tag", {}> => {
  return component.__kind === "tag";
};

export const isDataComponentType = <Data>(
  component: ComponentType<ComponentKind, Data>,
): component is ComponentType<"data", Data> => {
  return component.kind === "data";
};

export const isDataComponent = <Data>(
  component: BaseComponent<ComponentKind, Data>,
): component is BaseComponent<"data", Data> => {
  return component.__kind === "data";
};
