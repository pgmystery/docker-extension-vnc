import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(), nodePolyfills({
    include: ['crypto'],
  })],
  base: "./",
  build: {
    outDir: "build",
    target: 'esnext', // you can also use 'es2020' here
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext', // you can also use 'es2020' here
    },
  },
});
