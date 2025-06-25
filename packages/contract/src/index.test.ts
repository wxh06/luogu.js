import { initClient } from "@ts-rest/core";
import { describe, expect, test } from "vitest";

import { contract } from "./index.js";

const client = initClient(contract, {
  baseUrl: "https://www.luogu.com.cn",
  validateResponse: true,
});

describe("user.show", () => {
  test("200", async () => {
    const result = await client["user.show"]({
      params: { uid: 108135 },
      headers: { "x-luogu-type": "content-only" },
    });
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.body.code).toBe(200);
      if (result.body.code === 200)
        expect(result.body.currentData.user.uid).toBe(108135);
    }
  });

  test("404", async () => {
    const result = await client["user.show"]({
      params: { uid: 4 },
      headers: { "x-luogu-type": "content-only" },
    });
    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.body.code).toBe(404);
      if (result.body.code === 404)
        expect(result.body.currentData.errorMessage).toBe("用户未找到");
    }
  });
});
