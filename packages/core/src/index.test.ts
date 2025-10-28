import { expect, test } from "vitest";

import { Client } from "./index.js";

const client = new Client();

test("user", async () => {
  const data = await client.cn
    .get("user.show", {
      params: { uid: 108135 },
    })
    .then((res) => res.json());
  expect(data.status).toBe(200);
  expect(data.data.user.uid).toBe(108135);
});
