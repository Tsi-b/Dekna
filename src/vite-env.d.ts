/// <reference types="vite/client" />

// Allow importing SVGs as URLs (used by category icons, etc.)
declare module '*.svg' {
  const src: string;
  export default src;
}
