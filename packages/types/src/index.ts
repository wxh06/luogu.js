import type {
  Activity,
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
  DataResponse,
  LentilleDataResponse,
  List,
  LoginRequest,
  LoginResponse,
  Paste,
  PostData,
  PostListData,
  UserData,
} from "../luogu-api-docs/luogu-api.d.ts";
import type { Log } from "./judgement.js";

export type * from "../luogu-api-docs/luogu-api.d.ts";

export type Config = Omit<ConfigResponse, "route" | "routes"> & {
  route: Record<Route, string>;
  routes: Record<Route, string>;
};

export type Method = keyof MethodRoute;
export type Route<M extends Method = Method> = MethodRoute[M];

interface MethodRoute {
  GET:
    | "paste.show"
    | "user.show"
    | "api.feed.list"
    | "auth.login"
    | "judgement"
    | "api.article.list"
    | "article.list"
    | "article.collection"
    | "article.mine"
    | "article.favored"
    | "article.show"
    | "article.replies"
    | "article.available_collection"
    | "captcha"
    | "discuss.list"
    | "discuss.show";
  POST: "api.auth.logout" | "do_auth.password";
}

export interface RouteParams {
  "paste.show": { id: string };
  "user.show": { uid: number };
  "article.collection": { id: number };
  "article.show": { lid: string };
  "article.replies": { lid: string };
  "article.available_collection": { lid: string };
  "discuss.show": { id: number };
}

export interface RouteQueryParams {
  "api.feed.list": { user?: number; page?: number };
  "api.article.list": ArticleListParams;
  "article.list": { category?: number; page?: number };
  "article.collection": { page?: number };
  "article.mine": CreatedArticleListParams;
  "article.favored": { page?: number };
  "article.replies": { sort?: string; after?: number };
  "discuss.list": { forum?: string; page?: number };
  "discuss.show": { page?: number; sort?: string };
}

export interface RouteRequestBody {
  "do_auth.password": ["application/json", LoginRequest];
}

export interface RouteResponse {
  "paste.show": DataResponse<{ paste: Paste }>;
  "user.show": LentilleDataResponse<UserData>;
  "api.feed.list": { feeds: List<Activity> };
  judgement: LentilleDataResponse<{ logs: Log[] }>;
  "api.article.list": { articles: List<Article> };
  "article.list": LentilleDataResponse<ArticleListData>;
  "article.collection": LentilleDataResponse<ArticleCollectionData>;
  "article.mine": LentilleDataResponse<CreatedArticleListData>;
  "article.favored": { favorites: List<{ time: number; article: Article }> };
  "article.show": LentilleDataResponse<ArticleData>;
  "article.replies": { replySlice: Comment[] };
  "article.available_collection": { collections: ArticleCollectionSummary[] };
  "do_auth.password": LoginResponse;
  "discuss.list": LentilleDataResponse<PostListData>;
  "discuss.show": LentilleDataResponse<PostData>;
}
