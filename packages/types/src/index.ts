import type {
  Article,
  ArticleCollectionData,
  ArticleCollectionSummary,
  ArticleData,
  ArticleListData,
  ArticleListParams,
  Comment,
  ConfigResponse,
  CreatedArticleListData,
  CreatedArticleListParams,
  LentilleDataResponse,
  List,
  LoginRequest,
  LoginResponse,
  UserData,
} from "../luogu-api-docs/luogu-api.d.ts";

export type * from "../luogu-api-docs/luogu-api.d.ts";

export type Config = Omit<ConfigResponse, "route" | "routes"> & {
  route: Record<Route, string>;
  routes: Record<Route, string>;
};

export type Method = keyof MethodRoute;
export type Route<M extends Method = Method> = MethodRoute[M];

interface MethodRoute {
  GET:
    | "user.show"
    | "auth.login"
    | "api.article.list"
    | "article.list"
    | "article.collection"
    | "article.mine"
    | "article.favored"
    | "article.show"
    | "article.replies"
    | "article.available_collection"
    | "captcha";
  POST: "api.auth.logout" | "do_auth.password";
}

export interface RouteParams {
  "user.show": { uid: number };
  "article.collection": { id: number };
  "article.show": { lid: string };
  "article.replies": { lid: string };
  "article.available_collection": { lid: string };
}

export interface RouteQueryParams {
  "api.article.list": ArticleListParams;
  "article.list": { category?: number; page?: number };
  "article.collection": { page?: number };
  "article.mine": CreatedArticleListParams;
  "article.favored": { page?: number };
  "article.replies": { sort?: string; after?: number };
}

export interface RouteRequestBody {
  "do_auth.password": ["application/json", LoginRequest];
}

export interface RouteResponse {
  "user.show": LentilleDataResponse<UserData>;
  "api.article.list": { articles: List<Article> };
  "article.list": LentilleDataResponse<ArticleListData>;
  "article.collection": LentilleDataResponse<ArticleCollectionData>;
  "article.mine": LentilleDataResponse<CreatedArticleListData>;
  "article.favored": { favorites: List<{ time: number; article: Article }> };
  "article.show": LentilleDataResponse<ArticleData>;
  "article.replies": { replySlice: Comment[] };
  "article.available_collection": { collections: ArticleCollectionSummary[] };
  "do_auth.password": LoginResponse;
}
