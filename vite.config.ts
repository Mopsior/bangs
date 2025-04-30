import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [
          /\/dataset\//
        ]
      }
    }),
  ],
});
