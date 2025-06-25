import { initContract } from "@ts-rest/core";
import * as z from "zod/v4";

import { Uid } from "./params.js";
import { contentOnlyResponse, User } from "./schemas.js";

const c = initContract();
export const contract = c.router(
  {
    "user.show": {
      method: "GET",
      path: "/user/:uid",
      pathParams: z.object({ uid: Uid }),
      headers: {
        "x-luogu-type": z.literal("content-only"),
      },
      responses: {
        200: z.discriminatedUnion("code", [
          contentOnlyResponse({
            code: z.literal(200),
            currentTemplate: z.literal("UserShow"),
            currentData: z.object({ user: User }),
            currentTitle: z.literal("个人中心"),
          }),
          contentOnlyResponse({
            code: z.literal(404),
            currentTemplate: z.literal("InternalError"),
            currentData: z.object({
              errorType: z.literal(
                "LuoguFramework\\HttpFoundation\\Controller\\Exception\\HttpException\\NotFoundHttpException",
              ),
              errorMessage: z.literal("用户未找到"),
              errorTrace: z.literal(""),
            }),
            currentTitle: z.literal("出错了"),
          }),
        ]),
      },
    },
  },
  {
    baseHeaders: {
      cookie: z.optional(z.string()),
    },
  },
);
