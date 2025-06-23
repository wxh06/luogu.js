import { assertType, expectTypeOf, test } from "vitest";

import type { DataResponse, UserData } from "@lgjs/types";

import { Client } from "./index.js";

const client = new Client();

test("get", () => {
  expectTypeOf(client).toBeObject();
  expectTypeOf(client.get).toBeFunction();
});

test("options type", async () => {
  // @ts-expect-error argument '""' not assignable to parameter of type 'GetRoute'
  await client.get("", {});

  // @ts-expect-error 'params' is required
  await client.get("user.show", {});
  // @ts-expect-error 'uid' is required
  await client.get("user.show", { params: {} });
  await client.get("user.show", { params: { uid: 108135 } });

  // @ts-expect-error 'query' is required
  await client.get("api.article.list", {});
  // @ts-expect-error 'user' is required
  await client.get("api.article.list", { query: {} });
  await client.get("api.article.list", { query: { user: 1 } });
});

test("response type", async () => {
  assertType<DataResponse<UserData>>(
    await (await client.get("user.show", { params: { uid: 108135 } })).json(),
  );
});
