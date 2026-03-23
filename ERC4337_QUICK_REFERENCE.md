# ERC-4337 Quick Reference Card

## 🚀 Essential Commands

### Install Dependencies
```bash
npm install @privy-io/react-auth @privy-io/wagmi @tanstack/react-query permissionless viem wagmi react-hot-toast
npm install -D buffer process
```

### Environment Variables (.env)
```bash
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PIMLICO_API_KEY=your_pimlico_api_key
VITE_POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

## 📦 Key Imports

```javascript
// Privy (Authentication)
import { usePrivy, useWallets, useCreateWallet } from "@privy-io/react-auth";

// Viem (Blockchain)
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { polygonAmoy } from "viem/chains";

// Permissionless (Account Abstraction)
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";
```

## 🔧 Configuration Snippets

### Privy Provider Setup
```javascript
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ["google", "email"],
    embeddedWallets: {
      createOnLogin: "all-users", // KEY: Auto-create wallet
    },
    defaultChain: polygonAmoy,
    supportedChains: [polygonAmoy],
  }}
>
```

### Pimlico URL Format
```javascript
const PIMLICO_URL = `https://api.pimlico.io/v2/80002/rpc?apikey=${PIMLICO_API_KEY}`;
// 80002 = Polygon Amoy testnet
// 137 = Polygon mainnet
```

### Smart Account Creation
```javascript
const smartAccount = await toSimpleSmartAccount({
  client: publicClient,
  owner: walletClient,
  entryPoint: { address: entryPoint07Address, version: "0.7" },
});

const client = createSmartAccountClient({
  account: smartAccount,
  chain: polygonAmoy,
  bundlerTransport: http(PIMLICO_URL),
  paymaster: pimlicoClient,
});
```

## 💸 Gasless Transaction Pattern

```javascript
// 1. Fetch gas prices (REQUIRED!)
const gasPrice = await pimlicoClient.getUserOperationGasPrice();

// 2. Send transaction
const txHash = await smartAccountClient.sendTransaction({
  to: CONTRACT_ADDRESS,
  data: callData,
  maxFeePerGas: gasPrice.fast.maxFeePerGas,
  maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
});
```

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Buffer is not defined` | Add Buffer polyfill to index.html |
| `User already has wallet` | Use `createOnLogin: "all-users"` |
| `Smart Account not ready` | Check `authenticated && ready && wallets.length` |
| `Paymaster rejected` | Fetch gas prices from Pimlico first |

## 📊 Chain IDs

| Network | Chain ID | RPC Pattern |
|---------|----------|-------------|
| Polygon Amoy (testnet) | 80002 | `/v2/80002/rpc` |
| Polygon Mainnet | 137 | `/v2/137/rpc` |
| Ethereum Sepolia | 11155111 | `/v2/11155111/rpc` |
| Base Sepolia | 84532 | `/v2/84532/rpc` |

## 🔗 Essential Links

- **Privy Dashboard**: https://dashboard.privy.io/
- **Pimlico Dashboard**: https://dashboard.pimlico.io/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Polygon Amoy Faucet**: https://faucet.polygon.technology/
- **Amoy Explorer**: https://amoy.polygonscan.com/
- **JiffyScan (UserOp Explorer)**: https://jiffyscan.xyz/

## 📝 Checklist for New Project

- [ ] Get Privy App ID
- [ ] Get Pimlico API Key
- [ ] Get Alchemy RPC URL
- [ ] Deploy contract to testnet
- [ ] Install dependencies
- [ ] Add Buffer polyfills
- [ ] Configure PrivyProvider
- [ ] Create useSmartAccount hook
- [ ] Create transaction hook
- [ ] Test authentication
- [ ] Test gasless transactions
- [ ] Verify on block explorer

## 💡 Pro Tips

1. **Always fetch gas prices** before sending transactions
2. **Store Smart Account address**, not EOA address
3. **Use `useRef`** to prevent duplicate initialization
4. **Test on testnet** extensively before mainnet
5. **Implement retry logic** for failed transactions
6. **Monitor Pimlico dashboard** for UserOp status
7. **Cache Smart Account client** after creation
8. **Add proper loading states** for better UX

## 🎯 EntryPoint v0.7 Address

```javascript
// Canonical address (same on all networks)
0x0000000071727De22E5E9d8BAf0edAc6f37da032
```

---

**For full documentation, see: `ERC4337_COMPLETE_GUIDE.md`**
