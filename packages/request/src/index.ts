import { getUserAgent } from "universal-user-agent";

import type { Config, Method, Route } from "@lgjs/types";

import pkg from "../package.json";
import type {
  MethodRequest,
  RequestHeaders,
  RequestOptionsBase,
} from "./types.js";
import { addHeaders, expandTemplate, toSearchParams } from "./utils.js";

const BASE_URL = "https://www.luogu.com.cn";
const CONFIG_PATH = "/_lfe/config";
const ROUTE_KEY = "route";

export class RequestClient<H extends RequestHeaders = object> {
  readonly baseUrl: string;
  private readonly defaultHeaders: Headers;
  constructor(
    options: {
      baseUrl?: string;
      headers?: H;
    } = {},
  ) {
    this.baseUrl = options.baseUrl ?? BASE_URL;
    this.defaultHeaders = new Headers();
    this.defaultHeaders.set(
      "user-agent",
      `lgjs-request/${pkg.version} ${getUserAgent()}`,
    );
    addHeaders(this.defaultHeaders, { ...options.headers });
  }

  withHeaders<NH extends RequestHeaders>(
    headers: NH,
  ): RequestClient<Omit<H, keyof NH> & NH> {
    const client = new RequestClient({
      baseUrl: this.baseUrl,
      headers: {
        ...Object.fromEntries(this.defaultHeaders),
        ...headers,
      },
    });
    client._config = this._config;
    return client;
  }

  async fetch(
    method: Method,
    route: string,
    { params, query, ...options }: RequestOptionsBase = {},
  ): Promise<Response> {
    const url = new URL(this.baseUrl + expandTemplate(route, params ?? {}));
    if (query) url.search = toSearchParams(query).toString();

    const headers = new Headers(this.defaultHeaders);
    addHeaders(headers, options.headers);

    let body: string | URLSearchParams | null = null;
    if (options.body) {
      headers.set("content-type", options.body[0]);
      if (options.body[0] === "application/json")
        body = JSON.stringify(options.body[1]);
      else body = toSearchParams(options.body[1]).toString();
    }

    return fetch(url, { ...options, method, headers, body });
  }

  private _config: Config | Record<string, never> = {};
  private get config(): Config | undefined {
    if (Object.keys(this._config).length === 0) return undefined;
    return this._config as Config;
  }
  private set config(value: Config | undefined) {
    if (value) Object.assign(this._config, value);
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

  get: MethodRequest<"GET", H> = async (
    route: Route,
    options?: RequestOptionsBase,
  ): Promise<Response> =>
    this.fetch("GET", await this.getRoute(route), options);

  post: MethodRequest<"POST", H> = async (
    route: Route,
    options?: RequestOptionsBase,
  ): Promise<Response> =>
    this.fetch("POST", await this.getRoute(route), options);
}
