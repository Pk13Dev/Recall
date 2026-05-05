const { defineConfig } = require("vite");
const { viteSingleFile } = require("vite-plugin-singlefile");
const fs = require("fs");
const path = require("path");

function normalizeGeneratedHtmlNewlines(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const normalizedHtml = html.replace(/\r\r\n/g, "\r\n\r\n");
  if (normalizedHtml !== html) {
    fs.writeFileSync(filePath, normalizedHtml);
  }
}

function prepareRefIndexForTauri() {
  return {
    name: "prepare-ref-index-for-tauri",
    apply: "build",
    closeBundle() {
      const outputDirectory = path.resolve(__dirname, "dist", "ref");
      const refIndexPath = path.join(outputDirectory, "RefIndex.html");
      const tauriIndexPath = path.join(outputDirectory, "index.html");

      if (!fs.existsSync(refIndexPath)) {
        return;
      }

      normalizeGeneratedHtmlNewlines(refIndexPath);
      fs.copyFileSync(refIndexPath, tauriIndexPath);
    }
  };
}

module.exports = defineConfig({
  assetsInclude: ["**/*.mp3"],
  base: "./",
  plugins: [
    viteSingleFile({ removeViteModuleLoader: true }),
    prepareRefIndexForTauri()
  ],
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
