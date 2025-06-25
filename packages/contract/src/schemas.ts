import * as z from "zod/v4";

import type { User as LuoguUser, Theme } from "@lgjs/types";

export const User = z.custom<LuoguUser>(); // TODO

export const contentOnlyResponse = <
  T extends {
    code: unknown;
    currentTemplate: unknown;
    currentData: unknown;
    currentTitle: unknown;
  },
>(
  schema: T,
) =>
  z.object({
    ...schema,
    currentTheme: z.nullable(z.custom<Theme>()),
    currentTime: z.int(),
    currentUser: z.optional(User),
  });

export const ContentOnlyResponseError = contentOnlyResponse({
  code: z.int().gte(400),
  currentTemplate: z.literal("InternalError"),
  currentData: z.object({
    errorType: z.string(),
    errorMessage: z.string(),
    errorTrace: z.string(),
  }),
  currentTitle: z.string(),
});
