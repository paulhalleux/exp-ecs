import { ComponentType, createComponentType } from "./index";

/**
 * Defines a Tag component type.
 * Tag components are used to mark entities without storing additional data.
 * @param options Optional configuration for the Tag component.
 * @returns A ComponentType representing the Tag component.
 */
export function defineTag(options?: {
  name?: string;
}): ComponentType<"tag", {}> {
  return createComponentType({
    ...options,
    kind: "tag",
    lifetime: "persistent",
  });
}
