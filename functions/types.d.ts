// Global Cloudflare Pages Functions Ambient Declarations
// Ensures zero-error type resolution in editors and TypeScript checkers

declare global {
  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run<T = unknown>(): Promise<D1Result<T>>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
  }

  interface D1Result<T = unknown> {
    results?: T[];
    success: boolean;
    error?: string;
    meta?: any;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1Result<unknown>>;
  }

  interface R2HttpMetadata {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  }

  interface R2PutOptions {
    httpMetadata?: R2HttpMetadata;
    customMetadata?: Record<string, string>;
  }

  interface R2Object {
    key: string;
    version: string;
    size: number;
    etag: string;
    httpEtag: string;
    uploaded: Date;
    httpMetadata?: R2HttpMetadata;
    customMetadata?: Record<string, string>;
  }

  interface R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(key: string): Promise<any | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
    delete(keys: string | string[]): Promise<void>;
  }

  interface EventContext<Env, P extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Env;
    params: Record<P, string | string[]>;
    data: Data;
  }

  type PagesFunction<
    Env = unknown,
    P extends string = string,
    Data extends Record<string, unknown> = Record<string, unknown>
  > = (context: EventContext<Env, P, Data>) => Response | Promise<Response>;
}

export {};

