import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // 🔹 Keep this as `/` for Vercel
  build: {
    outDir: "dist",
  },
});
