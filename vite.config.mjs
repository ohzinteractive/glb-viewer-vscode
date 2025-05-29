import fs from 'fs';
import path from 'path';
import pug from 'pug';
import { defineConfig } from 'vite';
import packagejson from './package.json';

const pugLocals = { package: packagejson };

function watchPugFiles() {
  return {
    name: 'watch-all-pug',
    buildStart() {
      // Recursively add all .pug files in your src/webview directory
      const walk = dir => {
        fs.readdirSync(dir).forEach(file => {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else if (file.endsWith('.pug')) {
            this.addWatchFile(fullPath);
          }
        });
      };
      walk(path.resolve(__dirname, 'src/webview'));
    }
  };
}

function compilePugToHtml() {

  const templatePath = path.resolve(__dirname, 'src/webview/index.pug');
  const htmlPath = path.resolve(__dirname, 'src/webview/index.html');

  return {
    name: 'compile-index-pug',
    buildStart() {
      this.addWatchFile(templatePath);
    },
    async generateBundle() {
      const html = pug.renderFile(templatePath, {
        pretty: true,
        package: require('./package.json')
      });

      let currentHtml = '';
      try {
        currentHtml = fs.readFileSync(htmlPath, 'utf-8');
      } catch (e) {
        // File doesn't exist yet
      }

      if (html !== currentHtml) {
        fs.writeFileSync(htmlPath, html, 'utf-8');
        console.log('[vite-plugin] Updated index.html from index.pug');
      }
    }
  };
}

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
    compilePugToHtml(),
    watchPugFiles(),
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
