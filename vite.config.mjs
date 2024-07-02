import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['three'], // Ensure 'three' is included in optimizeDeps
  },
  resolve: {
    extensions: ['.js', '.glb'], // Include .glb in extensions if necessary
  },
});