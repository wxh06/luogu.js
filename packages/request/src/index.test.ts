import { assert, expect, test } from "vitest";

import { RequestClient as Client } from "./index.js";

const client = new Client();

test("user", async () => {
  const data = await client
    .get("user.show", {
      headers: { "x-lentille-request": "content-only" },
      params: { uid: 108135 },
    })
    .then((res) => res.json());
  expect(data.status).toBe(200);
  expect(data.data.user.uid).toBe(108135);
});

test("withHeaders", async () => {
  const client = new Client();
  const clientWithHeaders = client.withHeaders({
    "x-lentille-request": "content-only",
  });
  await clientWithHeaders
    .get("user.show", { params: { uid: 108135 } })
    .then((res) => res.json()); // make sure the response is JSON
  // @ts-expect-error reading private property
  expect(client.config).toBeDefined();
  assert((await client.getConfig()) === (await clientWithHeaders.getConfig()));
});
