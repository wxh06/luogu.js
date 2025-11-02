import type { UserSummary } from "../luogu-api-docs/luogu-api";

export interface Log {
  user: UserSummary;
  reason: string;
  revokedPermission: number;
  addedPermission: number;
  time: number;
}
