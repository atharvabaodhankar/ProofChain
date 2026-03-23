import { useState, useCallback, useRef }            from "react";
import { usePrivy, useWallets, useCreateWallet }    from "@privy-io/react-auth";
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

  // Guard — prevents re-running after createWallet() updates wallets[]
  const initCalledRef = useRef(false);

  const initSmartAccount = useCallback(async () => {
    if (!authenticated)       return;
    if (initCalledRef.current) return; // already ran or running
    initCalledRef.current = true;      // lock immediately

    setLoading(true);
    setError(null);

    try {
      // Find Privy embedded wallet
      let wallet = wallets.find(
        w => w.walletClientType === "privy" ||
             w.connectorType    === "embedded"
      );

      // Not found — create it explicitly
      if (!wallet) {
        console.log("Creating Privy embedded wallet...");
        wallet = await createWallet();
        console.log("Created:", wallet?.address);
      }

      if (!wallet) throw new Error("Failed to get embedded wallet.");

      console.log("Using embedded wallet:", wallet.address);

      await wallet.switchChain(80002);
      const provider = await wallet.getEthereumProvider();

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
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      const smartAccount = await toSimpleSmartAccount({
        client:     publicClient,
        owner:      walletClient,
        entryPoint: { address: entryPoint07Address, version: "0.7" },
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

    } catch (err) {
      console.error("Init failed:", err.message);
      setError(err.message);
      initCalledRef.current = false; // allow retry on error
    } finally {
      setLoading(false);
    }
  }, [authenticated]); // ← only authenticated, nothing that changes mid-run

  const handleLogout = useCallback(async () => {
    await logout();
    initCalledRef.current = false; // reset so next login works
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
    initSmartAccount,
    smartAccountAddress,
    nexusClient:  smartAccountClient,
    pimlicoClient,
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}