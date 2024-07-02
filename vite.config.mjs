import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],
  assetsInclude: ["**/*.glb"],
});