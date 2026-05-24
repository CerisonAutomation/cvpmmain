import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(async ({ mode }) => {
  const isProd = mode === 'production';
  const plugins = [react()];

  if (process.env.REPORT) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(visualizer({ open: true, gzipSize: true, brotliSize: true }));
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
      // Strip console.* in production
      drop: isProd ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': { target: process.env.VITE_API_PROXY || 'http://localhost:8000', changeOrigin: true },
        '/ws': { target: 'http://localhost:8000', ws: true, changeOrigin: true },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: false,
      // Warn on chunks over 600KB, hard limit at 1MB
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
            maps: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  };
});
