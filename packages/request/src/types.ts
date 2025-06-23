import type {
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

type RequestOptions<R extends Route> = Omit<
  RequestOptionsBase,
  "params" | "query" | "body"
> &
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

type RouteWithOptionalOptions<M extends Method> = {
  [R in Route<M>]: AllOptional<RequestOptions<R>> extends true ? R : never;
}[Route<M>];

export interface MethodRequest<M extends Method> {
  <
    T extends RouteWithOptionalOptions<M>,
    R = T extends keyof RouteResponse ? RouteResponse[T] : never,
  >(
    route: T,
  ): Promise<JsonResponse<R>>;
  <
    T extends Route<M>,
    R = T extends keyof RouteResponse ? RouteResponse[T] : never,
  >(
    route: T,
    options: RequestOptions<T>, // eslint-disable-line @typescript-eslint/unified-signatures
  ): Promise<JsonResponse<R>>;
}
