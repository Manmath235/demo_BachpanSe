import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const here = path.dirname(fileURLToPath(import.meta.url));

// Standalone admin panel. It shares source (store, LMS screens, Supabase layer) with the PWA
// in ../src, and reads the same .env at the repo root.
export default defineConfig({
  root: here,
  envDir: path.resolve(here, ".."),
  publicDir: path.resolve(here, "../public"),
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_APP_MODE": JSON.stringify("admin"),
  },
  resolve: {
    alias: { "@": path.resolve(here, "../src") },
    dedupe: ["react", "react-dom"],
  },
  server: { port: 5174, strictPort: true },
  build: { outDir: path.resolve(here, "dist"), emptyOutDir: true },
});
