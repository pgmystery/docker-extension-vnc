import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr()],
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
