import { request as octokitRequest } from "@octokit/request";
import pkg from "../package.json" assert { type: "json" };

export const request: typeof octokitRequest = octokitRequest.defaults({
  baseUrl: "https://www.luogu.com.cn",
  headers: {
    accept: "application/json",
    "user-agent": `lgjs-request/${pkg.version} ${octokitRequest.endpoint.DEFAULTS.headers["user-agent"]}`,
  },
});
