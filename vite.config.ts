import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const hasInstalledReact = existsSync(fileURLToPath(new URL('./node_modules/react', import.meta.url)));
const fallbackReactAliases = hasInstalledReact
  ? {}
  : {
      'react/jsx-runtime': fileURLToPath(new URL('./src/vendor/react/jsx-runtime.ts', import.meta.url)),
      react: fileURLToPath(new URL('./src/vendor/react/index.ts', import.meta.url)),
      'react-dom/client': fileURLToPath(new URL('./src/vendor/react-dom-client.ts', import.meta.url)),
    };

export default defineConfig({
  resolve: {
    alias: fallbackReactAliases,
  },
});
