# ERC-4337 Complete Implementation Guide

## 📋 Table of Contents
1. [What is ERC-4337?](#what-is-erc-4337)
2. [Why Use ERC-4337?](#why-use-erc-4337)
3. [Architecture Overview](#architecture-overview)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [Environment Variables](#environment-variables)
7. [Code Implementation](#code-implementation)
8. [Testing & Debugging](#testing--debugging)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)
11. [References](#references)

---

## What is ERC-4337?

**ERC-4337** (Account Abstraction) is an Ethereum standard that enables **Smart Contract Wallets** without requiring protocol-level changes. It allows users to:

- **Pay gas fees in any token** (or have someone else pay them)
- **Batch multiple transactions** into one
- **Social recovery** of accounts
- **Programmable transaction logic** (spending limits, whitelists, etc.)

### Key Components:
- **Smart Account**: Your user's wallet (a smart contract)
- **Bundler**: Collects UserOperations and submits them to the blockchain
- **Paymaster**: Optionally sponsors gas fees for users
- **EntryPoint**: The main contract that processes UserOperations (v0.7)

---

## Why Use ERC-4337?

### Problems It Solves:
1. **Gas Fees**: Users need native tokens (ETH, MATIC) to transact → Paymaster sponsors fees
2. **Private Key Management**: Losing keys = losing funds → Social recovery possible
3. **UX Friction**: Complex wallet setup → Embedded wallets with email/social login
4. **Transaction Limits**: One action per transaction → Batch operations


### Real-World Benefits:
- **Gasless Transactions**: Users don't need to buy crypto to start using your dApp
- **Better Onboarding**: Login with Google/Email instead of MetaMask
- **Enhanced Security**: Multi-sig, session keys, spending limits
- **Improved UX**: No more "insufficient funds for gas" errors

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         YOUR DAPP                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Privy      │  │ Permissionless│  │   Pimlico    │     │
│  │ (Auth Layer) │  │  (AA Library) │  │  (Bundler +  │     │
│  │              │  │               │  │  Paymaster)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  EntryPoint    │
                    │  Contract      │
                    │  (v0.7)        │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Smart Account  │
                    │ (User's Wallet)│
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Your Contract  │
                    │ (ProofOfExistence)│
                    └────────────────┘
```

### Flow:
1. User authenticates via **Privy** (Google/Email)
2. **Privy** creates an embedded wallet automatically
3. **Permissionless** creates a Smart Account from the embedded wallet
4. User initiates transaction → **Pimlico Bundler** packages it
5. **Pimlico Paymaster** sponsors gas fees
6. Transaction executes on blockchain via **EntryPoint**

---

## Prerequisites

### Required Accounts & API Keys:

1. **Privy Account** (Authentication)
   - Sign up: https://dashboard.privy.io/
   - Create a new app
   - Get your `App ID`

2. **Pimlico Account** (Bundler + Paymaster)
   - Sign up: https://dashboard.pimlico.io/
   - Create a new project
   - Get your `API Key`
   - Enable Polygon Amoy testnet

3. **Alchemy/Infura Account** (RPC Provider)
   - Sign up: https://www.alchemy.com/ or https://infura.io/
   - Create a new app on Polygon Amoy
   - Get your RPC URL

4. **Smart Contract Deployed**
   - Deploy your contract to Polygon Amoy testnet
   - Get the contract address

### Required Dependencies:

```json
{
  "dependencies": {
    "@privy-io/react-auth": "^3.18.0",
    "@privy-io/wagmi": "^4.0.3",
    "@tanstack/react-query": "^5.95.0",
    "permissionless": "^0.3.4",
    "viem": "2.47.4",
    "wagmi": "^3.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "buffer": "^6.0.3",
    "process": "^0.11.10"
  }
}
```

---

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install @privy-io/react-auth @privy-io/wagmi @tanstack/react-query permissionless viem wagmi react-hot-toast
npm install -D buffer process
```

### Step 2: Configure Vite (vite.config.js)

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@noble/curves/nist.js": "@noble/curves/nist",
    },
  },
  define: {
    global: 'globalThis',
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
```


**Why?** Viem and Permissionless use Node.js modules that need polyfills in the browser.

### Step 3: Add Polyfills to index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <script type="module">
      import { Buffer } from 'buffer'
      import process from 'process'
      window.Buffer = Buffer
      window.process = process
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Why?** `Buffer` and `process` are Node.js globals that viem/permissionless expect.

### Step 4: Setup Privy Provider (main.jsx)

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { polygonAmoy } from "viem/chains";
import { http } from "viem";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  transports: { [polygonAmoy.id]: http() },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ["google", "email"],
        embeddedWallets: {
          createOnLogin: "all-users", // Auto-create wallet
        },
        defaultChain: polygonAmoy,
        supportedChains: [polygonAmoy],
        appearance: {
          theme: "dark",
          accentColor: "#7c3aed",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <BrowserRouter>
            <Toaster position="top-right" />
            <App />
          </BrowserRouter>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </React.StrictMode>
);
```

**Key Configuration:**
- `createOnLogin: "all-users"` → Automatically creates embedded wallet on login
- `loginMethods` → Choose authentication methods (Google, Email, Twitter, etc.)
- `defaultChain` → Set your target blockchain


---

## Environment Variables

Create a `.env` file in your frontend directory:

```bash
# ============================================
# PRIVY CONFIGURATION (Authentication)
# ============================================
# Get from: https://dashboard.privy.io/
VITE_PRIVY_APP_ID=your_privy_app_id_here

# ============================================
# PIMLICO CONFIGURATION (Bundler + Paymaster)
# ============================================
# Get from: https://dashboard.pimlico.io/
VITE_PIMLICO_API_KEY=your_pimlico_api_key_here

# ============================================
# RPC PROVIDER (Blockchain Connection)
# ============================================
# Get from: https://www.alchemy.com/ or https://infura.io/
# For Polygon Amoy testnet
VITE_POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

# ============================================
# SMART CONTRACT
# ============================================
# Your deployed contract address on Polygon Amoy
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### Environment Variable Breakdown:

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `VITE_PRIVY_APP_ID` | Privy authentication | https://dashboard.privy.io/ → Create App |
| `VITE_PIMLICO_API_KEY` | Bundler & Paymaster services | https://dashboard.pimlico.io/ → API Keys |
| `VITE_POLYGON_AMOY_RPC_URL` | Blockchain RPC endpoint | https://www.alchemy.com/ → Create App → Polygon Amoy |
| `VITE_CONTRACT_ADDRESS` | Your smart contract | Deploy contract, copy address |

### Important Notes:
- **Testnet First**: Always test on Polygon Amoy before mainnet
- **API Key Security**: Never commit `.env` to git (add to `.gitignore`)
- **Pimlico Limits**: Free tier has rate limits, upgrade for production
- **RPC Provider**: Alchemy free tier is sufficient for testing

---

## Code Implementation

### 1. Smart Account Hook (useSmartAccount.js)

This hook manages the Smart Account creation and lifecycle.

```javascript
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
```


  const initSmartAccount = useCallback(async () => {
    if (!authenticated || !ready) return;

    // Wait for wallet to be created by Privy
    if (!wallets || wallets.length === 0) {
      if (!walletCreationAttempted.current) {
        walletCreationAttempted.current = true;
        try {
          await createWallet();
          return; // Wait for next effect run
        } catch (err) {
          if (!err.message.includes('already has')) {
            setError("Failed to create wallet");
          }
          return;
        }
      }
      return;
    }

    if (initCalledRef.current) return;
    initCalledRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      await wallet.switchChain(80002); // Polygon Amoy
      const provider = await wallet.getEthereumProvider();

      // Create wallet client from embedded wallet
      const walletClient = createWalletClient({
        account: wallet.address,
        chain: polygonAmoy,
        transport: custom(provider),
      });

      // Create public client for reading blockchain
      const publicClient = createPublicClient({
        chain: polygonAmoy,
        transport: http(RPC_URL),
      });

      // Create Pimlico client (bundler + paymaster)
      const pimlico = createPimlicoClient({
        transport: http(PIMLICO_URL),
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      // Create Smart Account
      const smartAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: walletClient,
        entryPoint: { address: entryPoint07Address, version: "0.7" },
      });

      // Create Smart Account Client
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
      initCalledRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [authenticated, wallets, ready, createWallet]);

  useEffect(() => {
    initSmartAccount();
  }, [initSmartAccount]);

  const handleLogout = useCallback(async () => {
    await logout();
    initCalledRef.current = false;
    walletCreationAttempted.current = false;
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
    smartAccountAddress,
    nexusClient: smartAccountClient,
    pimlicoClient,
    loading,
    error,
    isReady: !!smartAccountClient && !!smartAccountAddress,
  };
}
```

**Key Points:**
- Waits for Privy to create embedded wallet automatically
- Creates Smart Account from embedded wallet
- Handles race conditions with `useRef` flags
- Returns client objects for transaction submission


---

### 2. Gasless Transaction Hook (useGaslessProof.js)

This hook handles submitting transactions with gas sponsorship.

```javascript
import { useState, useCallback } from "react";
import { encodeFunctionData } from "viem";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ABI = [
  {
    name: "createProof",
    type: "function",
    inputs: [
      { name: "_dataHash", type: "bytes32" },
      { name: "_creatorName", type: "string" },
    ],
  },
];

async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function useGaslessProof(smartAccountClient, pimlicoClient) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitProof = useCallback(async (text, creatorName) => {
    if (!smartAccountClient) throw new Error("Smart Account not ready.");
    if (!pimlicoClient) throw new Error("Pimlico client not ready.");
    if (!text) throw new Error("Text is required.");
    if (!creatorName) throw new Error("Creator name is required.");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Hash data locally (privacy-preserving)
      const dataHash = await sha256(text);
      console.log("SHA-256 hash:", dataHash);

      // 2. Encode function call
      const callData = encodeFunctionData({
        abi: ABI,
        functionName: "createProof",
        args: [dataHash, creatorName],
      });

      // 3. Fetch gas prices from Pimlico
      // CRITICAL: Paymaster needs these to sponsor the transaction
      console.log("Fetching gas prices from Pimlico...");
      const gasPrice = await pimlicoClient.getUserOperationGasPrice();
      console.log("Gas price (fast):", gasPrice.fast);

      // 4. Send UserOperation (gasless transaction)
      // Pimlico paymaster sponsors the gas fees
      console.log("Sending UserOperation...");
      const txHash = await smartAccountClient.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: callData,
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      });

      console.log("✅ Confirmed on chain:", txHash);

      const proofResult = {
        dataHash,
        transactionHash: txHash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
        creatorName,
        timestamp: Date.now(),
      };

      setResult(proofResult);
      return proofResult;

    } catch (err) {
      console.error("Proof failed:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [smartAccountClient, pimlicoClient]);

  return { 
    submitProof, 
    loading, 
    error, 
    result, 
    resetResult: () => setResult(null) 
  };
}
```

**Key Points:**
- **Gas Price Fetching**: Must fetch gas prices from Pimlico before sending
- **Paymaster Sponsorship**: Pimlico automatically sponsors gas on testnet
- **Privacy**: Data is hashed locally, only hash goes on-chain
- **Error Handling**: Proper error states for UI feedback


---

### 3. Using in Components

```javascript
import { useSmartAccount } from '../hooks/useSmartAccount';
import { useGaslessProof } from '../hooks/useGaslessProof';
import toast from 'react-hot-toast';

export default function CreateProof() {
  const { 
    user, 
    authenticated, 
    smartAccountAddress, 
    nexusClient, 
    pimlicoClient 
  } = useSmartAccount();
  
  const { submitProof, loading, error } = useGaslessProof(nexusClient, pimlicoClient);
  
  const [textContent, setTextContent] = useState('');
  const [creatorName, setCreatorName] = useState(user?.google?.name || '');

  const handleSubmit = async () => {
    if (!textContent.trim() || !creatorName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await submitProof(textContent.trim(), creatorName.trim());
      toast.success('Proof created successfully!');
      console.log('Transaction:', result.transactionHash);
      console.log('Explorer:', result.explorerUrl);
    } catch (err) {
      toast.error(error || 'Failed to create proof');
    }
  };

  if (!authenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Create Proof</h1>
      <input
        type="text"
        value={creatorName}
        onChange={(e) => setCreatorName(e.target.value)}
        placeholder="Your name"
      />
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Content to timestamp"
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create Proof'}
      </button>
      <p>Smart Account: {smartAccountAddress}</p>
    </div>
  );
}
```

---

## Testing & Debugging

### 1. Check Smart Account Creation

Open browser console and look for:
```
Wallets available: 1
✅ Smart Account ready: 0x1234...
```

### 2. Test Transaction Submission

```javascript
console.log("SHA-256 hash:", dataHash);
console.log("Fetching gas prices from Pimlico...");
console.log("Gas price (fast):", gasPrice.fast);
console.log("Sending UserOperation...");
console.log("✅ Confirmed on chain:", txHash);
```

### 3. Verify on Block Explorer

Visit: `https://amoy.polygonscan.com/tx/{txHash}`

Check:
- Transaction status (Success ✓)
- From address (your Smart Account)
- To address (your contract)
- Gas paid by (should be Pimlico paymaster)

### 4. Common Console Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Buffer is not defined` | Missing polyfills | Add Buffer/process to index.html |
| `User already has an embedded wallet` | Duplicate wallet creation | Use `createOnLogin: "all-users"` |
| `Smart Account not ready` | Called before initialization | Check `isReady` before submitting |
| `Paymaster rejected` | Invalid gas prices | Fetch gas prices from Pimlico first |
| `Insufficient funds` | Paymaster not configured | Check Pimlico API key and testnet |


---

## Common Issues & Solutions

### Issue 1: "Buffer is not defined"

**Cause**: Viem uses Node.js Buffer in browser

**Solution**: Add polyfills to `index.html`:
```html
<script type="module">
  import { Buffer } from 'buffer'
  import process from 'process'
  window.Buffer = Buffer
  window.process = process
</script>
```

### Issue 2: "User already has an embedded wallet"

**Cause**: Trying to create wallet when Privy already created one

**Solution**: Use `createOnLogin: "all-users"` in Privy config:
```javascript
<PrivyProvider
  config={{
    embeddedWallets: {
      createOnLogin: "all-users", // Auto-create
    },
  }}
>
```

### Issue 3: Smart Account Not Initializing

**Cause**: Race condition between authentication and wallet creation

**Solution**: Use proper state management:
```javascript
const initCalledRef = useRef(false);
const walletCreationAttempted = useRef(false);

// Check authenticated, ready, and wallets before initializing
if (!authenticated || !ready || !wallets.length) return;
```

### Issue 4: "Paymaster rejected UserOperation"

**Cause**: Missing or incorrect gas prices

**Solution**: Always fetch gas prices from Pimlico:
```javascript
const gasPrice = await pimlicoClient.getUserOperationGasPrice();

await smartAccountClient.sendTransaction({
  to: CONTRACT_ADDRESS,
  data: callData,
  maxFeePerGas: gasPrice.fast.maxFeePerGas,
  maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
});
```

### Issue 5: Transactions Failing Silently

**Cause**: Not waiting for transaction confirmation

**Solution**: Use proper async/await:
```javascript
const txHash = await smartAccountClient.sendTransaction({...});
console.log("✅ Confirmed:", txHash);
```

### Issue 6: "Chain not supported"

**Cause**: Wallet on wrong network

**Solution**: Switch chain before operations:
```javascript
await wallet.switchChain(80002); // Polygon Amoy
```

### Issue 7: Pimlico Rate Limits

**Cause**: Too many requests on free tier

**Solution**: 
- Implement request throttling
- Upgrade to paid plan for production
- Cache gas prices for short periods

---

## Best Practices

### 1. Security

✅ **DO:**
- Hash sensitive data client-side before sending to blockchain
- Validate all user inputs before submission
- Use environment variables for API keys
- Implement rate limiting on transaction submissions
- Add spending limits to Smart Accounts in production

❌ **DON'T:**
- Store private keys in code or localStorage
- Commit `.env` files to version control
- Trust user input without validation
- Skip error handling on transactions

### 2. User Experience

✅ **DO:**
- Show loading states during transaction submission
- Display clear error messages
- Provide transaction explorer links
- Auto-retry failed transactions (with limits)
- Show Smart Account address to users

❌ **DON'T:**
- Block UI during initialization
- Hide transaction status from users
- Assume transactions succeed without confirmation
- Force users to understand blockchain concepts

### 3. Performance

✅ **DO:**
- Cache Smart Account client after creation
- Batch multiple operations when possible
- Use `useCallback` and `useMemo` for expensive operations
- Implement proper cleanup in `useEffect`

❌ **DON'T:**
- Recreate Smart Account on every render
- Make unnecessary RPC calls
- Fetch gas prices repeatedly for same transaction
- Initialize multiple Smart Accounts per user


### 4. Production Checklist

Before deploying to production:

- [ ] Test on testnet extensively (Polygon Amoy)
- [ ] Upgrade Pimlico to paid plan (free tier has limits)
- [ ] Implement transaction monitoring and alerts
- [ ] Add analytics for Smart Account creation success rate
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure proper CORS for production domain
- [ ] Add rate limiting to prevent abuse
- [ ] Implement session management for long-lived sessions
- [ ] Test with multiple authentication methods
- [ ] Verify gas sponsorship limits with Pimlico
- [ ] Set up backup RPC providers (Alchemy + Infura)
- [ ] Document Smart Account recovery process
- [ ] Add spending limits and security policies
- [ ] Test on multiple browsers and devices
- [ ] Prepare user documentation

---

## Smart Contract Considerations

### EntryPoint v0.7 Compatible Contract

Your contract doesn't need special modifications for ERC-4337, but consider:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProofOfExistence {
    event ProofCreated(
        bytes32 indexed dataHash,
        address indexed creator,    // This will be Smart Account address
        string creatorName,
        uint256 timestamp,
        uint256 blockNumber
    );

    mapping(bytes32 => bool) public proofExists;
    mapping(bytes32 => uint256) public proofTimestamp;
    mapping(bytes32 => address) public proofCreator;
    mapping(bytes32 => string) public proofCreatorName;

    function createProof(bytes32 _dataHash, string calldata _creatorName) external {
        require(_dataHash != bytes32(0), "Invalid hash");
        require(bytes(_creatorName).length > 0, "Name required");
        require(!proofExists[_dataHash], "Proof already exists");

        proofExists[_dataHash] = true;
        proofTimestamp[_dataHash] = block.timestamp;
        proofCreator[_dataHash] = msg.sender; // Smart Account address
        proofCreatorName[_dataHash] = _creatorName;

        emit ProofCreated(
            _dataHash,
            msg.sender,
            _creatorName,
            block.timestamp,
            block.number
        );
    }

    function verifyProof(bytes32 _dataHash)
        external
        view
        returns (
            bool exists,
            uint256 timestamp,
            address creator,
            string memory creatorName
        )
    {
        return (
            proofExists[_dataHash],
            proofTimestamp[_dataHash],
            proofCreator[_dataHash],
            proofCreatorName[_dataHash]
        );
    }
}
```

**Key Points:**
- `msg.sender` will be the Smart Account address, not the EOA
- Events should index important fields for efficient querying
- Use `calldata` for strings to save gas
- Add proper validation and error messages

---

## Advanced Features

### 1. Batch Transactions

Submit multiple operations in one UserOperation:

```javascript
const txHash = await smartAccountClient.sendTransactions({
  transactions: [
    {
      to: CONTRACT_ADDRESS_1,
      data: callData1,
      value: 0n,
    },
    {
      to: CONTRACT_ADDRESS_2,
      data: callData2,
      value: 0n,
    },
  ],
  maxFeePerGas: gasPrice.fast.maxFeePerGas,
  maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
});
```

### 2. Session Keys

Allow temporary permissions without full account access:

```javascript
import { toECDSASmartAccount } from "permissionless/accounts";

// Create session key with limited permissions
const sessionKey = privateKeyToAccount(generatePrivateKey());

// Grant session key permission to call specific functions
// Implementation depends on your Smart Account type
```

### 3. Social Recovery

Implement account recovery with trusted contacts:

```javascript
// Add recovery contacts to Smart Account
// Implementation varies by Smart Account provider
// Consider using Safe or Biconomy for built-in recovery
```

### 4. Spending Limits

Set daily/weekly spending limits:

```javascript
// Configure in Smart Account policy
// Prevents unauthorized large transactions
// Implementation depends on Smart Account type
```


---

## Migration from Traditional Wallets

### From MetaMask to ERC-4337

**Before (MetaMask):**
```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
const tx = await contract.createProof(hash, name);
await tx.wait();
```

**After (ERC-4337):**
```javascript
const { nexusClient, pimlicoClient } = useSmartAccount();
const { submitProof } = useGaslessProof(nexusClient, pimlicoClient);
const result = await submitProof(text, name);
// User pays 0 gas!
```

**Benefits:**
- No MetaMask installation required
- No gas fees for users
- Better mobile experience
- Social login (Google, Email)
- Programmable security policies

---

## Cost Analysis

### Gas Costs Comparison

| Operation | Traditional Wallet | ERC-4337 (Sponsored) |
|-----------|-------------------|----------------------|
| First Transaction | ~$0.50 - $2.00 | $0.00 (Paymaster) |
| Subsequent Transactions | ~$0.10 - $0.50 | $0.00 (Paymaster) |
| Smart Account Deployment | N/A | ~$0.50 (one-time, can be sponsored) |

### Pimlico Pricing (as of 2024)

**Free Tier:**
- 1,000 UserOperations/month
- Testnet only
- Perfect for development

**Starter ($99/month):**
- 10,000 UserOperations/month
- Mainnet support
- Email support

**Growth ($499/month):**
- 100,000 UserOperations/month
- Priority support
- Custom gas policies

**Enterprise (Custom):**
- Unlimited UserOperations
- Dedicated infrastructure
- SLA guarantees

### Cost Optimization Tips

1. **Batch Transactions**: Combine multiple operations
2. **Gas Price Timing**: Submit during low network activity
3. **Efficient Contracts**: Optimize contract gas usage
4. **Selective Sponsorship**: Only sponsor certain operations
5. **User Pays Option**: Allow users to pay gas if they prefer

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Smart Account Creation Rate**
   - Success rate
   - Time to create
   - Failure reasons

2. **Transaction Success Rate**
   - UserOperation success/failure
   - Gas estimation accuracy
   - Paymaster rejection rate

3. **User Experience**
   - Time from click to confirmation
   - Error frequency
   - User drop-off points

4. **Cost Metrics**
   - Average gas cost per transaction
   - Total monthly gas spend
   - Cost per user

### Recommended Tools

- **Pimlico Dashboard**: UserOperation analytics
- **Alchemy/Infura**: RPC call monitoring
- **Sentry**: Error tracking
- **Mixpanel/Amplitude**: User behavior analytics
- **Custom Logging**: Transaction lifecycle tracking

### Example Logging

```javascript
// Log Smart Account creation
console.log("Smart Account Created", {
  address: smartAccountAddress,
  userId: user.id,
  timestamp: Date.now(),
  provider: "Privy",
});

// Log transaction submission
console.log("Transaction Submitted", {
  txHash,
  from: smartAccountAddress,
  to: CONTRACT_ADDRESS,
  gasSponsored: true,
  timestamp: Date.now(),
});

// Log errors
console.error("Transaction Failed", {
  error: err.message,
  userId: user.id,
  operation: "createProof",
  timestamp: Date.now(),
});
```


---

## References

### Official Documentation

1. **ERC-4337 Standard**
   - https://eips.ethereum.org/EIPS/eip-4337
   - Official Ethereum Improvement Proposal

2. **Privy Documentation**
   - https://docs.privy.io/
   - Authentication and embedded wallets
   - React SDK reference

3. **Pimlico Documentation**
   - https://docs.pimlico.io/
   - Bundler and Paymaster services
   - API reference and examples

4. **Permissionless.js**
   - https://docs.pimlico.io/permissionless
   - TypeScript library for ERC-4337
   - Smart Account creation guide

5. **Viem Documentation**
   - https://viem.sh/
   - Ethereum library (alternative to ethers.js)
   - Type-safe and lightweight

### Tutorials & Guides

1. **Account Abstraction Explained**
   - https://www.alchemy.com/overviews/account-abstraction
   - Beginner-friendly overview

2. **Building with ERC-4337**
   - https://www.youtube.com/watch?v=... (search for latest tutorials)
   - Video walkthroughs

3. **Privy + Pimlico Integration**
   - https://docs.privy.io/guide/guides/account-abstraction
   - Official integration guide

### Community Resources

1. **ERC-4337 Discord**
   - https://discord.gg/account-abstraction
   - Community support and discussions

2. **Privy Discord**
   - https://discord.gg/privy
   - Technical support

3. **Pimlico Discord**
   - https://discord.gg/pimlico
   - Bundler/Paymaster support

### Tools & Explorers

1. **JiffyScan**
   - https://jiffyscan.xyz/
   - UserOperation explorer
   - Track bundler activity

2. **Polygon Amoy Explorer**
   - https://amoy.polygonscan.com/
   - Verify transactions
   - Check Smart Account activity

3. **Tenderly**
   - https://tenderly.co/
   - Transaction simulation
   - Debugging tools

### Example Projects

1. **Privy Examples**
   - https://github.com/privy-io/privy-examples
   - Official example apps

2. **Permissionless Examples**
   - https://github.com/pimlicolabs/permissionless.js/tree/main/examples
   - Code samples and patterns

3. **This Project**
   - Your ProofChain implementation
   - Reference for future projects

---

## Frequently Asked Questions

### Q: Do I need to deploy my own EntryPoint contract?

**A:** No! EntryPoint v0.7 is already deployed on all major networks. Use the canonical address:
```javascript
import { entryPoint07Address } from "viem/account-abstraction";
// 0x0000000071727De22E5E9d8BAf0edAc6f37da032
```

### Q: Can users still use MetaMask if they want?

**A:** Yes! Privy supports external wallets. Users can choose between embedded wallet (email/social) or MetaMask/WalletConnect.

### Q: What happens if Pimlico goes down?

**A:** You can switch bundlers. Pimlico URL is just a configuration. Consider having backup bundlers configured.

### Q: How do I handle Smart Account addresses in my database?

**A:** Store the Smart Account address (not the EOA). This is the address that interacts with your contracts:
```javascript
// Store this
const smartAccountAddress = smartAccount.address;

// Not this (EOA/embedded wallet address)
const eoaAddress = wallet.address;
```

### Q: Can I use this on mainnet?

**A:** Yes! Change these:
- Chain: `polygonAmoy` → `polygon`
- RPC URL: Amoy RPC → Polygon mainnet RPC
- Pimlico URL: `/v2/80002/` → `/v2/137/`
- Upgrade Pimlico plan (free tier is testnet only)

### Q: How do I test without spending real money?

**A:** Use Polygon Amoy testnet:
1. Get free MATIC from faucet: https://faucet.polygon.technology/
2. Use Pimlico free tier (1,000 ops/month)
3. Test thoroughly before mainnet

### Q: What if a user loses access to their email/Google account?

**A:** Implement social recovery:
- Add recovery contacts
- Use multi-sig Smart Accounts
- Consider Privy's recovery options
- Document recovery process for users

### Q: Can I customize the Smart Account logic?

**A:** Yes! Use different Smart Account implementations:
- Simple Account (basic, used in this guide)
- Safe (multi-sig, recovery)
- Biconomy (modular, advanced features)
- Custom implementation

### Q: How do I handle failed transactions?

**A:** Implement retry logic with exponential backoff:
```javascript
async function submitWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```


---

## Quick Start Checklist

Use this checklist for your next ERC-4337 project:

### Setup Phase
- [ ] Create Privy account and get App ID
- [ ] Create Pimlico account and get API Key
- [ ] Create Alchemy/Infura account and get RPC URL
- [ ] Deploy smart contract to testnet
- [ ] Install dependencies: `@privy-io/react-auth`, `permissionless`, `viem`
- [ ] Install polyfills: `buffer`, `process`
- [ ] Create `.env` file with all keys
- [ ] Add `.env` to `.gitignore`

### Configuration Phase
- [ ] Configure Vite with polyfills and optimizations
- [ ] Add Buffer/process to `index.html`
- [ ] Setup PrivyProvider with `createOnLogin: "all-users"`
- [ ] Configure WagmiProvider with target chain
- [ ] Add React Router and Toaster

### Implementation Phase
- [ ] Create `useSmartAccount` hook
- [ ] Create `useGaslessProof` (or your transaction hook)
- [ ] Implement authentication UI
- [ ] Implement transaction submission UI
- [ ] Add loading states and error handling
- [ ] Add transaction confirmation feedback

### Testing Phase
- [ ] Test authentication flow (Google, Email)
- [ ] Verify Smart Account creation in console
- [ ] Test transaction submission
- [ ] Verify transactions on block explorer
- [ ] Test error scenarios (network issues, rejections)
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

### Production Phase
- [ ] Upgrade Pimlico to paid plan
- [ ] Switch to mainnet configuration
- [ ] Add monitoring and analytics
- [ ] Implement error tracking
- [ ] Add rate limiting
- [ ] Document user flows
- [ ] Prepare support documentation
- [ ] Set up backup RPC providers

---

## Troubleshooting Guide

### Problem: Smart Account not initializing

**Debug Steps:**
1. Check console for errors
2. Verify Privy authentication: `console.log(authenticated, ready)`
3. Check wallet creation: `console.log(wallets.length)`
4. Verify API keys in `.env`
5. Check network connectivity

**Common Causes:**
- Privy not ready yet
- Wallet not created
- Wrong API keys
- Network issues

### Problem: Transactions failing

**Debug Steps:**
1. Check gas prices: `console.log(gasPrice)`
2. Verify contract address
3. Check Pimlico dashboard for errors
4. Verify Smart Account has correct permissions
5. Check contract function signature

**Common Causes:**
- Missing gas prices
- Wrong contract address
- Paymaster rejection
- Contract reverted
- Insufficient paymaster balance

### Problem: "Buffer is not defined"

**Solution:**
```html
<!-- Add to index.html BEFORE other scripts -->
<script type="module">
  import { Buffer } from 'buffer'
  import process from 'process'
  window.Buffer = Buffer
  window.process = process
</script>
```

### Problem: Slow transaction confirmation

**Possible Causes:**
- Network congestion
- Low gas prices
- Bundler delays

**Solutions:**
- Use `gasPrice.fast` instead of `gasPrice.standard`
- Check network status
- Implement timeout handling

### Problem: Paymaster rejecting transactions

**Debug Steps:**
1. Check Pimlico dashboard for rejection reason
2. Verify API key is valid
3. Check if testnet is enabled
4. Verify gas price fetching

**Common Causes:**
- Invalid API key
- Testnet not enabled
- Rate limits exceeded
- Invalid UserOperation

---

## Version Compatibility

This guide uses:

| Package | Version | Notes |
|---------|---------|-------|
| `@privy-io/react-auth` | ^3.18.0 | Latest stable |
| `@privy-io/wagmi` | ^4.0.3 | Wagmi v2 compatible |
| `permissionless` | ^0.3.4 | EntryPoint v0.7 |
| `viem` | 2.47.4 | Required for permissionless |
| `wagmi` | ^3.5.0 | Latest v3 |
| `react` | ^18.2.0 | React 18+ required |

**Important:** Version mismatches can cause issues. Use exact versions for production.

### Upgrading Packages

When upgrading, check:
1. Breaking changes in release notes
2. EntryPoint version compatibility
3. Viem version requirements
4. Privy SDK changes

---

## Summary

You now have a complete ERC-4337 implementation with:

✅ **Authentication**: Privy with Google/Email login
✅ **Smart Accounts**: Automatic creation via Permissionless
✅ **Gasless Transactions**: Pimlico paymaster sponsorship
✅ **Type Safety**: Viem for blockchain interactions
✅ **User Experience**: No MetaMask, no gas fees, social login

### Key Takeaways:

1. **ERC-4337 = Better UX**: Users don't need crypto to start
2. **Three Services**: Privy (auth) + Permissionless (AA) + Pimlico (bundler)
3. **Gas Prices Matter**: Always fetch from Pimlico before sending
4. **Smart Account ≠ EOA**: Store Smart Account address, not wallet address
5. **Test Thoroughly**: Use testnet extensively before mainnet

### Next Steps:

- Implement advanced features (batching, session keys)
- Add monitoring and analytics
- Optimize gas usage
- Prepare for production deployment
- Build amazing user experiences! 🚀

---

## Support

If you encounter issues:

1. Check this documentation first
2. Review console logs for errors
3. Check official documentation (Privy, Pimlico, Permissionless)
4. Join Discord communities for support
5. Open GitHub issues on respective repositories

**Good luck building with ERC-4337!** 🎉

---

*Last Updated: 2024*
*Based on: ProofChain Implementation*
*EntryPoint Version: 0.7*
