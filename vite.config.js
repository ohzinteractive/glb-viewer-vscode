import { defineConfig } from 'vite'
import pugPlugin from 'vite-plugin-pug'

export default defineConfig({
  root: 'src/webview',
  build: {
    outDir: '../../dist/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/webview/index.pug'
    }
  },
  plugins: [
    pugPlugin()
  ],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  }
})
