import path from "path";
import react from "@vitejs/plugin-react-swc";
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/@chakra-ui")) return "chakra-ui";
          if (id.includes("node_modules/@zip.js/zip.js")) return "zip-js";
          if (id.includes("node_modules/zod")) return "zod";
          return null;
        },
      },
      plugins: [
        // visualizer({
        //   brotliSize: true,
        //   gzipSize: true,
        //   open: true,
        // }),
      ],
    },
  },
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
