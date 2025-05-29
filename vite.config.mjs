import { defineConfig } from 'vite';
import vitePugPlugin from 'vite-plugin-pug-transformer';
import packagejson from './package.json';

export default defineConfig({
  root: 'src/webview',
  build: {
    outDir: '../../dist/webview',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/webview/index.html',
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          'three': ['three'],
          'three-addons': [
            'three/examples/jsm/Addons.js',
            'three/examples/jsm/controls/OrbitControls',
            'three/examples/jsm/loaders/DRACOLoader',
            'three/examples/jsm/loaders/GLTFLoader'
          ],
          'pit-js': ['pit-js']
        }
      }
    },
    chunkSizeWarningLimit: 700,
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'],
      treeShaking: true
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
  },
  base: './',
  optimizeDeps: {
    include: ['three']
  }
});
