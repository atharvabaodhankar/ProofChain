import { useState, useCallback, useRef, useEffect } from "react";
import { usePrivy, useWallets, useCreateWallet } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { polygonAmoy } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const RPC_URL = import.meta.env.VITE_POLYGON_AMOY_RPC_URL;
const PIMLICO_URL = `https://api.pimlico.io/v2/80002/rpc?apikey=${PIMLICO_API_KEY}`;

export function useSmartAccount() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();

  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [smartAccountClient, setSmartAccountClient] = useState(null);
  const [pimlicoClient, setPimlicoClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initCalledRef = useRef(false);
  const walletCreationAttempted = useRef(false);

  const initSmartAccount = useCallback(async () => {
    if (!authenticated) {
      console.log("Not authenticated yet");
      return;
    }

    if (!ready) {
      console.log("Privy not ready yet");
      return;
    }

    console.log("Wallets available:", wallets.length, wallets);

    // If no wallets and we haven't tried creating one yet, try to create
    if ((!wallets || wallets.length === 0) && !walletCreationAttempted.current && authenticated && ready) {
      console.log("No wallets found, attempting to create embedded wallet...");
      walletCreationAttempted.current = true;
      try {
        await createWallet();
        console.log("Wallet creation initiated");
        return; // Wait for next effect run after wallet is created
      } catch (err) {
        console.error("Failed to create wallet:", err);
        // Don't set error if wallet already exists - this is expected
        if (!err.message.includes('already has')) {
          setError("Failed to create wallet. Please try logging out and back in.");
        }
        return;
      }
    }

    if (!wallets || wallets.length === 0) {
      console.log("No wallets yet, waiting...");
      return;
    }

    if (initCalledRef.current) {
      console.log("Already initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the first available wallet (embedded or external like MetaMask)
      const wallet = wallets[0];

      if (!wallet) {
        console.log("Waiting for wallet to be created...");
        setLoading(false);
        return;
      }

      // Mark as initialized only after we have a wallet
      initCalledRef.current = true;

      console.log("Using wallet:", wallet.address, "Type:", wallet.walletClientType);

      await wallet.switchChain(80002);
      const provider = await wallet.getEthereumProvider();

      const walletClient = createWalletClient({
        account: wallet.address,
        chain: polygonAmoy,
        transport: custom(provider),
      });

      const publicClient = createPublicClient({
        chain: polygonAmoy,
        transport: http(RPC_URL),
      });

      const pimlico = createPimlicoClient({
        transport: http(PIMLICO_URL),
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      const smartAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: walletClient,
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      const client = createSmartAccountClient({
        account: smartAccount,
        chain: polygonAmoy,
        bundlerTransport: http(PIMLICO_URL),
        paymaster: pimlico,
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
  }, [authenticated, wallets, ready, createWallet]);

  // Auto-initialize when authenticated and wallet is ready
  useEffect(() => {
    initSmartAccount();
  }, [initSmartAccount]);

  const handleLogout = useCallback(async () => {
    await logout();
    initCalledRef.current = false; // reset so next login works
    walletCreationAttempted.current = false; // reset wallet creation flag
    setSmartAccountAddress(null);
    setSmartAccountClient(null);
    setPimlicoClient(null);
    setError(null);
  }, [logout]);

  return {
    login,
    logout: handleLogout,
    authenticated,
    user,
    initSmartAccount,
    smartAccountAddress,
    nexusClient: smartAccountClient,
    pimlicoClient,
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}
