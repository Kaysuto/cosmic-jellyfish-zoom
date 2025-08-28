import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
    sourcemap: true, // Activer les source maps en production pour le debugging
    minify: mode === 'production',
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          // Séparer les chunks pour optimiser le chargement
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
          streaming: ['@vidstack/react', 'vidstack'],
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
}));