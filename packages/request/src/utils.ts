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

export const toSearchParams = (
  params: Record<string, Primitive | undefined | null> = {},
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null)
      searchParams.set(key, encodeURIComponent(value));
  });
  return searchParams;
};
