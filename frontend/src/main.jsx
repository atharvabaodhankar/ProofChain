import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { polygonAmoy } from "viem/chains";
import { http } from "viem";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Wagmi config — only Polygon Amoy
const wagmiConfig = createConfig({
  chains:      [polygonAmoy],
  transports:  { [polygonAmoy.id]: http() },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        // Only show Google and email login
        loginMethods: ["google", "email"],

        // Automatically create an embedded wallet for every user
        embeddedWallets: {
          createOnLogin: "all-users",
        },

        // Default to Polygon Amoy
        defaultChain: polygonAmoy,
        supportedChains: [polygonAmoy],

        appearance: {
          theme:       "dark",
          accentColor: "#7c3aed",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </React.StrictMode>
);