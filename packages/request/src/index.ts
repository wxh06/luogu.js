import { getUserAgent } from "universal-user-agent";

import type { Config, GetRoute, Route, RouteResponse } from "@lgjs/types";

import pkg from "../package.json";
import type {
  JsonResponse,
  Method,
  RequestOptions,
  RequestOptionsBase,
} from "./types.js";
import { expandTemplate } from "./utils.js";

const BASE_URL = "https://www.luogu.com.cn";
const CONFIG_PATH = "/_lfe/config";
const ROUTE_KEY = "route";

export class Client {
  userAgent = `lgjs-request/${pkg.version} ${getUserAgent()}`;
  private config: Config | undefined;
  constructor(private baseUrl: string = BASE_URL) {}

  async fetch(
    method: Method,
    route: string,
    options: RequestOptionsBase = {},
  ): Promise<Response> {
    const url = new URL(
      this.baseUrl + expandTemplate(route, options.params ?? {}),
    );
    if (options.query)
      Object.entries(options.query).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, encodeURIComponent(value));
      });

    const headers = new Headers(options.headers);
    headers.set("user-agent", this.userAgent);
    headers.set("x-luogu-type", "content-only");
    headers.set("x-lentille-request", "content-only");

    let body: string | URLSearchParams | null = null;
    if (options.body) {
      if (options.body instanceof URLSearchParams) {
        headers.set("content-type", "application/x-www-form-urlencoded");
        body = options.body;
      } else {
        headers.set("content-type", "application/json");
        body = JSON.stringify(options.body);
      }
    }

    return fetch(url, { method, headers, body });
  }

  async getConfig(): Promise<Config> {
    if (!this.config) {
      const response = await this.fetch("GET", CONFIG_PATH);
      if (!response.ok) throw new Error("Failed to fetch config");
      this.config = (await response.json()) as Config;
    }
    return this.config;
  }

  private async getRoute(name: Route): Promise<string> {
    const config = await this.getConfig();
    const route = config[ROUTE_KEY][name];
    if (!route) throw new Error(`Route ${name} not found in config`);
    return route;
  }

  get = async <T extends GetRoute>(
    route: T,
    options: RequestOptions<T>,
  ): Promise<JsonResponse<RouteResponse[T]>> =>
    this.fetch(
      "GET",
      await this.getRoute(route),
      options as RequestOptionsBase,
    );
}
