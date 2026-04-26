const { defineConfig } = require("vite");
const { viteSingleFile } = require("vite-plugin-singlefile");
const path = require("path");

module.exports = defineConfig({
  assetsInclude: ["**/*.mp3"],
  base: "./",
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    open: "/RefIndex.html"
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    open: "/RefIndex.html"
  },
  build: {
    outDir: "dist/ref",
    emptyOutDir: true,
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: {
        ref: path.resolve(__dirname, "RefIndex.html")
      }
    }
  }
});
