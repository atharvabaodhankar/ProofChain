import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // fixes some viem internal resolution issues on Windows
      "@noble/curves/nist.js": "@noble/curves/nist",
    },
  },
  optimizeDeps: {
    include: [
      "permissionless",
      "viem",
      "@privy-io/react-auth",
      "@privy-io/wagmi",
    ],
  },
});