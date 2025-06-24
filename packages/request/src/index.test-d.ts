import { describe, expectTypeOf, test } from "vitest";

import type {
  Article,
  ArticleListData,
  DataResponse,
  LentilleDataResponse,
  List,
  UserData,
} from "@lgjs/types";

import { Client } from "./index.js";

const client = new Client();

test("request methods", () => {
  expectTypeOf(client).toBeObject();
  expectTypeOf(client.get).toBeFunction();
  expectTypeOf(client.post).toBeFunction();
});

describe("options", () => {
  test("invalid route", async () => {
    // @ts-expect-error argument '""' not assignable to parameter of type 'GetRoute'
    await client.get("", {});
  });

  test("no options", async () => {
    await client.get("captcha");
    await client.get("captcha", {});
  });

  test("params", async () => {
    // @ts-expect-error options is required
    await client.get("article.show");
    // @ts-expect-error 'params' is required
    await client.get("article.show", {});
    // @ts-expect-error 'lid' is required
    await client.get("article.show", { params: {} });
    await client.get("article.show", { params: { lid: "" } });

    await client.get("article.list", { params: {} });
    // @ts-expect-error 'number' not assignable to type 'never'
    await client.get("article.list", { params: { lid: "" } });
  });

  test("query", async () => {
    // @ts-expect-error options is required
    await client.get("api.article.list");
    // @ts-expect-error 'query' is required
    await client.get("api.article.list", {});
    // @ts-expect-error 'user' is required
    await client.get("api.article.list", { query: {} });
    await client.get("api.article.list", { query: { user: 1 } });

    await client.get("captcha", { query: {} });
    // @ts-expect-error 'number' not assignable to type 'never'
    await client.get("captcha", { query: { _t: 1 } });
  });

  test("body", async () => {
    // @ts-expect-error options is required
    await client.post("do_auth.password");
    // @ts-expect-error 'body' is required
    await client.post("do_auth.password", {});
    // @ts-expect-error '{}' not assignable to body
    await client.post("do_auth.password", { body: {} });
    // @ts-expect-error '{}' missing properties
    await client.post("do_auth.password", { body: ["application/json", {}] });
    await client.post("do_auth.password", {
      body: ["application/json", { username: "", password: "", captcha: "" }],
    });

    await client.get("captcha", { body: null });
    await client.get("captcha", { body: undefined });
    // @ts-expect-error '{}' not assignable to body
    await client.get("captcha", { body: {} });
  });
});

describe("response", () => {
  test("json", async () => {
    expectTypeOf(
      await (
        await client.get("api.article.list", { query: { user: 1 } })
      ).json(),
    ).toEqualTypeOf<{ articles: List<Article> }>();
  });

  test("image", async () => {
    expectTypeOf(await (await client.get("captcha", {})).json()).toBeNever();
  });

  test("data response", async () => {
    expectTypeOf(
      await (await client.get("user.show", { params: { uid: 108135 } })).json(),
    ).toBeNever();

    type UserDataResponse = DataResponse<UserData>;
    expectTypeOf(
      await (
        await client.get("user.show", {
          headers: { "x-luogu-type": "content-only" },
          params: { uid: 108135 },
        })
      ).json(),
    ).toEqualTypeOf<UserDataResponse>();
    expectTypeOf(
      await (
        await client.get("user.show", {
          headers: {
            "x-luogu-type": "content-only",
            "x-lentille-request": "content-only",
          },
          params: { uid: 108135 },
        })
      ).json(),
    ).toEqualTypeOf<UserDataResponse>();
  });

  test("lentille data response", async () => {
    expectTypeOf(await (await client.get("article.list")).json()).toBeNever();
    expectTypeOf(
      await (await client.get("article.list", {})).json(),
    ).toBeNever();

    type ArticleListDataResponse = LentilleDataResponse<ArticleListData>;
    expectTypeOf(
      await (
        await client.get("article.list", {
          headers: { "x-lentille-request": "content-only" },
        })
      ).json(),
    ).toEqualTypeOf<ArticleListDataResponse>();
    expectTypeOf(
      await (
        await client.get("article.list", {
          headers: {
            "x-luogu-type": "content-only",
            "x-lentille-request": "content-only",
          },
        })
      ).json(),
    ).toEqualTypeOf<ArticleListDataResponse>();
  });
});
