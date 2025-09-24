/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string;
declare const __GIT_HASH__: string;

interface Window {
  updateSW: (reloadPage?: boolean) => Promise<void>;
}

interface Navigator {
  standalone?: boolean;
}