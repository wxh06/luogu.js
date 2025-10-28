import type {
  DataResponse,
  LentilleDataResponse,
  Method,
  Route,
  RouteParams,
  RouteQueryParams,
  RouteRequestBody,
  RouteResponse,
} from "@lgjs/types";

interface JsonResponse<T> extends Response {
  readonly json: () => Promise<T>;
}

export type Primitive = Parameters<typeof encodeURIComponent>[0];

export interface RequestOptionsBase
  extends Omit<RequestInit, "method" | "headers" | "body"> {
  params?: Record<string, Primitive>;
  query?: Record<string, Primitive>;
  headers?: Record<string, string | null>;
  body?:
    | [contentType: "application/json", body: object]
    | [
        contentType: "application/x-www-form-urlencoded",
        body: Record<string, Primitive>,
      ]
    | null
    | undefined;
}

type AllOptional<T> = object extends T ? true : false;

export interface RequestHeaders {
  "cookie"?: string | null;
  "user-agent"?: string | null;
  "x-csrf-token"?: string | null;
  "x-luogu-type"?: "content-only" | null;
  "x-lentille-request"?: "content-only" | null;
}

type RequestOptions<
  R extends Route,
  M extends Method,
  H extends RequestHeaders,
> = Omit<RequestInit, "method" | "headers" | "body"> &
  ("GET" extends M
    ? { headers?: RequestHeaders }
    : H extends { "x-csrf-token": string }
      ? { headers?: RequestHeaders }
      : { headers: RequestHeaders & { "x-csrf-token": string } }) &
  (R extends keyof RouteParams
    ? { params: RouteParams[R] }
    : { params?: Record<string, never> }) &
  (R extends keyof RouteQueryParams
    ? AllOptional<RouteQueryParams[R]> extends true
      ? { query?: RouteQueryParams[R] }
      : { query: RouteQueryParams[R] }
    : { query?: Record<string, never> }) &
  (R extends keyof RouteRequestBody
    ? AllOptional<RouteRequestBody[R]> extends true
      ? { body?: RouteRequestBody[R] }
      : { body: RouteRequestBody[R] }
    : { body?: null | undefined });

type RouteWithOptionalOptions<M extends Method, H extends RequestHeaders> = {
  [R in Route<M>]: AllOptional<RequestOptions<R, M, H>> extends true
    ? R
    : never;
}[Route<M>];

type FetchResponseExclude<R extends Route, U> = JsonResponse<
  R extends keyof RouteResponse
    ? RouteResponse[R] extends U
      ? never
      : RouteResponse[R]
    : never
>;

export interface MethodRequest<
  M extends Method,
  H extends RequestHeaders = object,
> {
  <R extends RouteWithOptionalOptions<M, H>>(
    route: R,
  ): Promise<
    FetchResponseExclude<
      R,
      | (H extends { "x-luogu-type": "content-only" }
          ? never
          : DataResponse<unknown>)
      | (H extends { "x-lentille-request": "content-only" }
          ? never
          : LentilleDataResponse<unknown>)
    >
  >;

  <
    R extends Route<M>,
    O extends RequestOptions<R, M, Headers>,
    Headers extends RequestHeaders = Omit<H, keyof O["headers"]> & O["headers"],
  >(
    route: R,
    options: O,
  ): Promise<
    FetchResponseExclude<
      R,
      | (Headers extends { "x-luogu-type": "content-only" }
          ? never
          : DataResponse<unknown>)
      | (Headers extends { "x-lentille-request": "content-only" }
          ? never
          : LentilleDataResponse<unknown>)
    >
  >;
}
