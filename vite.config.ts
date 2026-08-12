import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<user>.github.io/second-audience-workbook/
// Override with VITE_BASE=/ for a custom domain or root deploy.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/second-audience-workbook/",
});
