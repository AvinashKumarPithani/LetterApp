import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // ✅ Ensures correct asset paths for deployment
  build: {
    outDir: "dist", // ✅ Ensures build goes inside `dist`
  },
});
