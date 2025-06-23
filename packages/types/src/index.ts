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
} from "../luogu-api-docs/luogu-api.d.ts";

export type * from "../luogu-api-docs/luogu-api.d.ts";

export type Config = Omit<ConfigResponse, "route" | "routes"> & {
  route: Record<Route, string>;
  routes: Record<Route, string>;
};

export interface RouteParams {
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

export interface RouteResponse {
  "api.article.list": { articles: List<Article> };
  "article.list": LentilleDataResponse<ArticleListData>;
  "article.collection": LentilleDataResponse<ArticleCollectionData>;
  "article.mine": LentilleDataResponse<CreatedArticleListData>;
  "article.favored": { favorites: List<{ time: number; article: Article }> };
  "article.show": LentilleDataResponse<ArticleData>;
  "article.replies": { replySlice: Comment[] };
  "article.available_collection": { collections: ArticleCollectionSummary[] };
}

export type GetRoute =
  | "api.article.list"
  | "article.list"
  | "article.collection"
  | "article.mine"
  | "article.favored"
  | "article.show"
  | "article.replies"
  | "article.available_collection";

export type Route = GetRoute;
