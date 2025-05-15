import { defineConfig } from 'vite';
import vitePugPlugin from 'vite-plugin-pug-transformer';
import packagejson from './package.json';

export default defineConfig({
  root: 'src/webview',
  build: {
    outDir: '../../dist/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/webview/index.html'
    }
  },
  plugins: [
    vitePugPlugin({
      pugLocals: {
        package: packagejson
      }
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
});
