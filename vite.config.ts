// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    externals: {
      inline: ["tslib", "pdf-lib", "@supabase/functions-js"],
    },
    hooks: {
      compiled() {
        try {
          const srcDir = path.resolve("node_modules/tslib");
          const targetDir = path.resolve(".vercel/output/functions/__server.func/node_modules/tslib");
          if (fs.existsSync(srcDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
            const files = fs.readdirSync(srcDir);
            for (const file of files) {
              const srcFile = path.join(srcDir, file);
              const targetFile = path.join(targetDir, file);
              if (fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, targetFile);
              }
            }
          }
        } catch (err) {
          console.error("Failed to copy tslib modules:", err);
        }
      },
    },
  },
  ssr: {
    noExternal: ["tslib", "pdf-lib", "@supabase/functions-js"],
  },
  resolve: {
    alias: {
      tslib: "tslib/tslib.js",
    },
  },
});
