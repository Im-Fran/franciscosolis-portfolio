/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the auth service, without a trailing slash. */
  readonly VITE_AUTH_BASE_URL?: string;
  /** Client ID this front-end is registered under on the auth service. */
  readonly VITE_AUTH_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
