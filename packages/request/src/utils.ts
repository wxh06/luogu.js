import type { Primitive } from "./types.js";

export const expandTemplate = (
  template: string,
  params: Record<string, Primitive>,
): string =>
  Object.entries(params).reduce(
    (result, [key, value]) =>
      result
        .replace(`{${key}}`, encodeURIComponent(value))
        .replace(`:${key}`, encodeURIComponent(value)),
    template,
  );
