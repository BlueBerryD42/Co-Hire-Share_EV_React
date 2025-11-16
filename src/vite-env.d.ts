/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_API_URL?: string
  readonly VITE_BOOKING_API_URL?: string
  readonly VITE_APP_NAME?: string
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
