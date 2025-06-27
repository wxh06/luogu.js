import { getSetCookies } from "undici";
import { getUserAgent } from "universal-user-agent";

import { RequestClient } from "@lgjs/request";

import pkg from "../package.json";

interface ClientHeaders {
  "user-agent": string;
  "x-luogu-type": "content-only";
  "x-lentille-request": "content-only";
}

interface LuoguClient {
  readonly cn: RequestClient<ClientHeaders>;
  readonly global: RequestClient<ClientHeaders>;
}

const BASE_URL_CN = "https://www.luogu.com.cn";
const BASE_URL_GLOBAL = "https://www.luogu.org";

export class Client implements LuoguClient {
  readonly cn;
  readonly global;

  constructor(
    options: {
      /** 应用名称 */
      application?: string;
      baseUrls?: {
        cn?: string;
        global?: string;
      };
      cookie?: string;
    } = {},
  ) {
    const userAgent =
      (options.application ? `${options.application} ` : "") +
      `lgjs-core/${pkg.version} ${getUserAgent()}`;

    const headers = {
      "user-agent": userAgent,
      "x-luogu-type": "content-only",
      "x-lentille-request": "content-only",
    } as const;
    this.cn = new RequestClient({
      baseUrl: options.baseUrls?.cn ?? BASE_URL_CN,
      headers,
    });
    this.global = new RequestClient({
      baseUrl: options.baseUrls?.global ?? BASE_URL_GLOBAL,
      headers,
    });
  }

  session(): Promise<Session>;
  session(clientId: string): Session;
  session(clientId?: string): Session | Promise<Session> {
    if (clientId) return new Session(clientId, this.cn, this.global);
    return this.cn.fetch("HEAD" as "GET", "/").then((res) => {
      const clientId = getSetCookies(res.headers).find(
        ({ name }) => name === "__client_id",
      )?.value;
      if (!clientId) throw new Error("Failed to find __client_id in response");
      return new Session(clientId, this.cn, this.global);
    });
  }
}

export class Session implements LuoguClient {
  private _uid = 0;
  get uid() {
    return this._uid;
  }
  private set uid(value) {
    this._uid = value;
    this.cn = this.cn.withHeaders({ cookie: this.cookie });
    this.global = this.global.withHeaders({ cookie: this.cookie });
  }
  private get cookie() {
    return `__client_id=${this.clientId}; uid=${String(this.uid)}`;
  }

  get cn() {
    return this._cn;
  }
  private set cn(value) {
    this._cn = value;
  }
  get global() {
    return this._global;
  }
  private set global(value) {
    this._global = value;
  }

  constructor(
    readonly clientId: string,
    private _cn: RequestClient<ClientHeaders>,
    private _global: RequestClient<ClientHeaders>,
  ) {
    this.uid = 0;
  }
}
