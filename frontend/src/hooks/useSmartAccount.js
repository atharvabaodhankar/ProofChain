import { useState, useCallback }            from "react";
import { usePrivy, useWallets, useCreateWallet } from "@privy-io/react-auth";
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
  const { createWallet }                       = useCreateWallet();

  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [smartAccountClient,  setSmartAccountClient]  = useState(null);
  const [pimlicoClient,       setPimlicoClient]       = useState(null);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState(null);

  // Find embedded wallet — Privy v3 uses walletClientType "privy"
  // but it must be explicitly created first
  const embeddedWallet = wallets.find(
    w => w.walletClientType === "privy" ||
         w.connectorType    === "embedded"
  );

  const initSmartAccount = useCallback(async () => {
    if (!authenticated) return;

    setLoading(true);
    setError(null);

    try {
      let wallet = embeddedWallet;

      // If no embedded wallet yet — create it explicitly
      // Privy v3 requires this call even with createOnLogin: "all-users"
      if (!wallet) {
        console.log("No embedded wallet found — creating one now...");
        try {
          const created = await createWallet();
          wallet = created;
          console.log("Embedded wallet created:", created?.address);
        } catch (createErr) {
          // If creation fails because wallet already exists, try finding it again
          console.log("Create wallet response:", createErr.message);
          // Re-check wallets array after creation attempt
          const fresh = wallets.find(
            w => w.walletClientType === "privy" ||
                 w.connectorType    === "embedded"
          );
          if (fresh) {
            wallet = fresh;
          } else {
            throw new Error("Could not create or find embedded wallet: " + createErr.message);
          }
        }
      }

      console.log("Using wallet:", wallet.address, "type:", wallet.walletClientType);

      // Switch to Polygon Amoy
      await wallet.switchChain(80002);

      // Get EIP-1193 provider from embedded wallet
      const provider = await wallet.getEthereumProvider();

      // Create wallet client — signs silently, zero popups
      const walletClient = createWalletClient({
        account:   wallet.address,
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
      console.log("   Signer (embedded):", wallet.address);
      console.log("   Zero MetaMask. Zero gas. Pure ERC-4337.");

      return { client, address: smartAccount.address };

    } catch (err) {
      console.error("Smart Account init failed:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, wallets, embeddedWallet, createWallet]);

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
    wallets,
    embeddedWallet,
    initSmartAccount,
    smartAccountAddress,
    nexusClient:  smartAccountClient,
    pimlicoClient,
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}