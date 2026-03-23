import { useState, useCallback } from "react";
import { usePrivy, useWallets }  from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { polygonAmoy }              from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount }     from "permissionless/accounts";
import { createPimlicoClient }      from "permissionless/clients/pimlico";
import { entryPoint07Address }      from "viem/account-abstraction";

const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const RPC_URL         = import.meta.env.VITE_POLYGON_AMOY_RPC_URL;
const PIMLICO_URL     = `https://api.pimlico.io/v2/80002/rpc?apikey=${PIMLICO_API_KEY}`;

export function useSmartAccount() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets }                            = useWallets();

  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [smartAccountClient,  setSmartAccountClient]  = useState(null);
  const [pimlicoClient,       setPimlicoClient]       = useState(null);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState(null);

  // Find Privy embedded wallet from the wallets array
  const embeddedWallet = wallets.find(
    w => w.walletClientType === "privy"
  );

  const initSmartAccount = useCallback(async () => {
    // Guard — both must be true before we proceed
    if (!authenticated)   return;
    if (!embeddedWallet)  return; // wallet not ready yet — useEffect will retry

    setLoading(true);
    setError(null);

    try {
      console.log("Privy embedded wallet found:", embeddedWallet.address);
      console.log("Setting up Smart Account — no MetaMask will open...");

      // Switch to Polygon Amoy
      await embeddedWallet.switchChain(80002);

      // Get provider from embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Wallet client from embedded wallet — signs silently, no popup
      const walletClient = createWalletClient({
        account:   embeddedWallet.address,
        chain:     polygonAmoy,
        transport: custom(provider),
      });

      const publicClient = createPublicClient({
        chain:     polygonAmoy,
        transport: http(RPC_URL),
      });

      const pimlico = createPimlicoClient({
        transport: http(PIMLICO_URL),
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });

      const smartAccount = await toSimpleSmartAccount({
        client:     publicClient,
        owner:      walletClient,
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });

      const client = createSmartAccountClient({
        account:          smartAccount,
        chain:            polygonAmoy,
        bundlerTransport: http(PIMLICO_URL),
        paymaster:        pimlico,
      });

      setPimlicoClient(pimlico);
      setSmartAccountClient(client);
      setSmartAccountAddress(smartAccount.address);

      console.log("✅ Smart Account ready:", smartAccount.address);
      console.log("   Zero MetaMask. Zero gas. Pure ERC-4337.");

      return { client, address: smartAccount.address };

    } catch (err) {
      console.error("Smart Account init failed:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, embeddedWallet]);

  const handleLogout = useCallback(async () => {
    await logout();
    setSmartAccountAddress(null);
    setSmartAccountClient(null);
    setPimlicoClient(null);
    setError(null);
  }, [logout]);

  return {
    login,
    logout:       handleLogout,
    authenticated,
    user,
    wallets,          // expose so ProofPage can watch it
    embeddedWallet,   // expose so ProofPage knows when it's ready
    initSmartAccount,
    smartAccountAddress,
    nexusClient:  smartAccountClient,
    pimlicoClient,
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}