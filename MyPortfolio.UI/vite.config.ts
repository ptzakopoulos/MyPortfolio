import { defineConfig } from "vite";

// GitHub Pages serves the site from https://<user>.github.io/MyPortfolio/,
// so production builds (and `vite preview`) need that sub-path as the base.
// The dev server stays at "/".
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/MyPortfolio/" : "/",
}));
