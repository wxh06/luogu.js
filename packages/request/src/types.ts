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

export interface RequestOptionsBase {
  params?: Record<string, Primitive>;
  query?: Record<string, Primitive>;
  headers?: ConstructorParameters<typeof Headers>[0];
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

type RequestOptions<R extends Route> = {
  headers?: {
    "x-luogu-type"?: "content-only";
    "x-lentille-request"?: "content-only";
  };
} & (R extends keyof RouteParams
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

type RouteWithOptionalOptions<M extends Method> = {
  [R in Route<M>]: AllOptional<RequestOptions<R>> extends true ? R : never;
}[Route<M>];

type FetchResponseExclude<R extends Route, U> = JsonResponse<
  R extends keyof RouteResponse
    ? RouteResponse[R] extends U
      ? never
      : RouteResponse[R]
    : never
>;

export interface MethodRequest<M extends Method> {
  <R extends RouteWithOptionalOptions<M>>(
    route: R,
  ): Promise<
    FetchResponseExclude<
      R,
      DataResponse<unknown> | LentilleDataResponse<unknown>
    >
  >;

  <R extends Route<M>, O extends RequestOptions<R>>(
    route: R,
    options: O,
  ): Promise<
    FetchResponseExclude<
      R,
      | (O["headers"] extends { "x-luogu-type": "content-only" }
          ? never
          : DataResponse<unknown>)
      | (O["headers"] extends { "x-lentille-request": "content-only" }
          ? never
          : LentilleDataResponse<unknown>)
    >
  >;
}
