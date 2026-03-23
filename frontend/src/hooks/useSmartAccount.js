import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWalletClient }      from "wagmi";
import { createPublicClient, http } from "viem";
import { polygonAmoy }              from "viem/chains";
import {
  createSmartAccountClient,
} from "permissionless";
import {
  toSimpleSmartAccount,
} from "permissionless/accounts";
import {
  createPimlicoClient,
} from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const RPC_URL         = import.meta.env.VITE_POLYGON_AMOY_RPC_URL;

// Pimlico bundler + paymaster URL for Polygon Amoy
const PIMLICO_URL = `https://api.pimlico.io/v2/80002/rpc?apikey=${PIMLICO_API_KEY}`;

export function useSmartAccount() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets }                            = useWallets();
  const { data: walletClient }                 = useWalletClient();

  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [smartAccountClient,  setSmartAccountClient]  = useState(null);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState(null);

  const initSmartAccount = useCallback(async () => {
    if (!authenticated || !walletClient) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Setting up Smart Account...");

      // Public client to read chain state
      const publicClient = createPublicClient({
        chain:     polygonAmoy,
        transport: http(RPC_URL),
      });

      // Pimlico client — handles bundler + paymaster in one
      const pimlicoClient = createPimlicoClient({
        transport: http(PIMLICO_URL),
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });

      // Create a Simple Smart Account
      // Signer = Privy embedded wallet (tied to Google/email identity)
      // Same login on any device = same Smart Account address always
      const smartAccount = await toSimpleSmartAccount({
        client:     publicClient,
        owner:      walletClient,
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });

      console.log("Smart Account address:", smartAccount.address);

      // Smart Account client — used to send UserOperations
      const client = createSmartAccountClient({
        account:             smartAccount,
        chain:               polygonAmoy,
        bundlerTransport:    http(PIMLICO_URL),
        paymaster:           pimlicoClient,  // Pimlico sponsors gas on testnet free
        paymasterContext: {
          sponsorshipPolicyIds: [], // empty = use default testnet sponsorship
        },
      });

      setSmartAccountClient(client);
      setSmartAccountAddress(smartAccount.address);

      console.log("✅ Smart Account ready — no MetaMask, no gas needed");
      return { client, address: smartAccount.address };

    } catch (err) {
      console.error("Smart Account init failed:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, walletClient]);

  const handleLogout = useCallback(async () => {
    await logout();
    setSmartAccountAddress(null);
    setSmartAccountClient(null);
    setError(null);
  }, [logout]);

  return {
    login,
    logout:      handleLogout,
    authenticated,
    user,
    initSmartAccount,
    smartAccountAddress,
    nexusClient: smartAccountClient, // keep same name so other hooks don't break
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}