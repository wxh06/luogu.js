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

// A Response whose .json() returns a typed value
interface JsonResponse<T> extends Response {
  readonly json: () => Promise<T>;
}

export type Primitive = Parameters<typeof encodeURIComponent>[0];

/**
 * Base options shape used by the runtime code. This is intentionally a
 * permissive shape (maps of primitives) rather than the route-specific
 * strongly-typed RequestOptions which comes later.
 */
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

// Helper: detect whether a route-specific type is effectively `object` (i.e.
// 'no constraints' meaning optional). This mirrors prior behaviour.
type AllOptional<T> = object extends T ? true : false;

export interface RequestHeaders {
  "cookie"?: string | null;
  "user-agent"?: string | null;
  "x-csrf-token"?: string | null;
  "x-luogu-type"?: "content-only" | null;
  "x-lentille-request"?: "content-only" | null;
}

type HeadersRequirement<M extends Method, H extends RequestHeaders> =
  // GET never requires CSRF header
  "GET" extends M
    ? { headers?: RequestHeaders }
    : H extends { "x-csrf-token": string }
      ? { headers?: RequestHeaders }
      : { headers: RequestHeaders & { "x-csrf-token": string } };

type ParamsForRoute<R extends Route> = R extends keyof RouteParams
  ? { params: RouteParams[R] }
  : { params?: Record<string, never> };

type QueryForRoute<R extends Route> = R extends keyof RouteQueryParams
  ? AllOptional<RouteQueryParams[R]> extends true
    ? { query?: RouteQueryParams[R] }
    : { query: RouteQueryParams[R] }
  : { query?: Record<string, never> };

type BodyForRoute<R extends Route> = R extends keyof RouteRequestBody
  ? AllOptional<RouteRequestBody[R]> extends true
    ? { body?: RouteRequestBody[R] }
    : { body: RouteRequestBody[R] }
  : { body?: null | undefined };

export type RequestOptions<
  R extends Route,
  M extends Method,
  H extends RequestHeaders,
> = Omit<RequestInit, "method" | "headers" | "body"> &
  HeadersRequirement<M, H> &
  ParamsForRoute<R> &
  QueryForRoute<R> &
  BodyForRoute<R>;

// Routes for which the generated RequestOptions are all-optional.
type RouteWithOptionalOptions<M extends Method, H extends RequestHeaders> = {
  [R in Route<M>]: AllOptional<RequestOptions<R, M, H>> extends true
    ? R
    : never;
}[Route<M>];

// Extract the declared response type for a route (if any).
type RouteResponseFor<R extends Route> = R extends keyof RouteResponse
  ? RouteResponse[R]
  : never;

// Build a JsonResponse for the route while excluding certain wrapper
// responses (e.g. DataResponse / LentilleDataResponse) when the caller
// requested content-only responses.
type ResponseForRouteExcluding<R extends Route, ExcludeU> = JsonResponse<
  RouteResponseFor<R> extends ExcludeU ? never : RouteResponseFor<R>
>;

/**
 * MethodRequest describes the call-signature for `.get` and `.post` on the
 * client. Two overloads are provided: one for routes that require no options
 * (call with just the route), and one that accepts route-specific options.
 *
 * The generic `H` tracks known default headers on the client so the resulting
 * return type can exclude wrapper response shapes when the client requests
 * content-only responses.
 */
export interface MethodRequest<
  M extends Method,
  H extends RequestHeaders = object,
> {
  // Helper: compute which wrapped response types should be excluded based on
  // the provided headers shape.
  <R extends RouteWithOptionalOptions<M, H>>(
    route: R,
  ): Promise<
    ResponseForRouteExcluding<
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
    ResponseForRouteExcluding<
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
