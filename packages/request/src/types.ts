import type { Route, RouteParams, RouteQueryParams } from "@lgjs/types";

export interface JsonResponse<T> extends Response {
  readonly json: () => Promise<T>;
}

export type Primitive = Parameters<typeof encodeURIComponent>[0];

export type Method = "GET" | "POST" | "DELETE";

export interface RequestOptionsBase {
  params?: Record<string, Primitive>;
  query?: Record<string, Primitive>;
  headers?: ConstructorParameters<typeof Headers>[0];
  body?: object | URLSearchParams;
}

export type RequestOptions<R extends Route> = Omit<
  RequestOptionsBase,
  "params" | "query"
> &
  (R extends keyof RouteParams
    ? { params: RouteParams[R] }
    : { params?: Record<string, never> }) &
  (R extends keyof RouteQueryParams
    ? object extends RouteQueryParams[R]
      ? { query?: RouteQueryParams[R] }
      : { query: RouteQueryParams[R] }
    : { query?: Record<string, never> });
