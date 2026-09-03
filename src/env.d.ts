/// <reference types="astro/client" />

export interface PageMetadata {
  pageIdentifier?: string;
  [key: string]: any;
}

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly BASE_NAME?: string;
  }
}

declare module "react-router-dom" {
  export interface IndexRouteObject {
    routeMetadata?: PageMetadata;
  }
  export interface NonIndexRouteObject {
    routeMetadata?: PageMetadata;
  }
}
