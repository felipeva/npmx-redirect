import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  alias: {
    '@': path.resolve(import.meta.dirname, './src'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }),
  manifest: {
    name: 'npmx Redirect',
    description: 'Redirects npmjs.com package pages to npmx.dev for a better experience',
    permissions: ['activeTab', 'declarativeNetRequest', 'storage'],
    host_permissions: ['*://*.npmjs.com/*'],
    icons: {
      16: 'icon/16.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
