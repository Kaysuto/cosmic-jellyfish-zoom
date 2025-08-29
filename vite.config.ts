import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Améliorer la gestion du HMR pour éviter les problèmes de cache
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: mode === 'production' ? './' : '/',
  build: {
    mode: mode === 'production' ? 'production' : 'development',
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: mode === 'production',
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: (id) => {
          // Améliorer la stratégie de chunks pour éviter les conflits
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animations';
            }
            if (id.includes('@vidstack') || id.includes('vidstack')) {
              return 'vendor-streaming';
            }
            return 'vendor';
          }
          // Séparer les pages pour éviter les conflits de chargement
          if (id.includes('/pages/')) {
            if (id.includes('MediaDetail')) {
              return 'page-media-detail';
            }
            if (id.includes('Admin')) {
              return 'page-admin';
            }
            return 'pages';
          }
          // Séparer les hooks pour éviter les dépendances circulaires
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
  },
  define: {
    __DEV__: mode === 'development',
  },
  // Améliorer la gestion des modules pour éviter les problèmes de chargement
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
    ],
    exclude: [
      // Exclure les modules qui peuvent causer des problèmes
    ],
  },
}));