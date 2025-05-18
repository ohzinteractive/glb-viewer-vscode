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
      external: [
        'three',
        'three/addons/loaders/GLTFLoader.js',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/controls/OrbitControls.js'
      ],
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
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
  base: './'
});
