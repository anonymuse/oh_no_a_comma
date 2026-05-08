/// <reference types="vite/client" />

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';

  export function createRoot(container: Element): {
    render(tree: ReactNode): void;
  };
}
