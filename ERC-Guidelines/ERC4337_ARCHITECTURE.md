# ERC-4337 Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                            │
│                         (React Frontend)                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Login UI   │  │  Create Proof│  │   Dashboard  │            │
│  │  (Google/    │  │      UI      │  │      UI      │            │
│  │   Email)     │  │              │  │              │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                    │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        REACT HOOKS LAYER                            │
│                                                                     │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐   │
│  │    useSmartAccount()         │  │   useGaslessProof()      │   │
│  │                              │  │                          │   │
│  │  • Authentication state      │  │  • Transaction logic     │   │
│  │  • Smart Account creation    │  │  • Gas price fetching    │   │
│  │  • Wallet management         │  │  • UserOp submission     │   │
│  │  • Client initialization     │  │  • Result handling       │   │
│  └──────────┬───────────────────┘  └──────────┬───────────────┘   │
│             │                                   │                   │
└─────────────┼───────────────────────────────────┼───────────────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES LAYER                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    PRIVY     │  │ PERMISSIONLESS│  │   PIMLICO    │            │
│  │              │  │               │  │              │            │
│  │ • Google     │  │ • Smart       │  │ • Bundler    │            │
│  │   OAuth      │  │   Account     │  │ • Paymaster  │            │
│  │ • Email      │  │   Client      │  │ • Gas Price  │            │
│  │   Auth       │  │ • EntryPoint  │  │   Oracle     │            │
│  │ • Embedded   │  │   v0.7        │  │ • UserOp     │            │
│  │   Wallet     │  │ • Viem        │  │   Bundling   │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                    │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                               │
│                    (Polygon Amoy Testnet)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │              EntryPoint Contract (v0.7)                  │     │
│  │         0x0000000071727De22E5E9d8BAf0edAc6f37da032       │     │
│  │                                                          │     │
│  │  • Validates UserOperations                             │     │
│  │  • Coordinates with Paymaster                           │     │
│  │  • Executes transactions via Smart Account              │     │
│  └──────────────────────┬───────────────────────────────────┘     │
│                         │                                          │
│                         ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           Smart Account Contract (Per User)              │     │
│  │              (Created by Permissionless)                 │     │
│  │                                                          │     │
│  │  • User's wallet (smart contract)                       │     │
│  │  • Owned by embedded wallet                             │     │
│  │  • Executes transactions                                │     │
│  │  • Programmable security policies                       │     │
│  └──────────────────────┬───────────────────────────────────┘     │
│                         │                                          │
│                         ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │         Your Smart Contract (ProofOfExistence)           │     │
│  │              0xEC42312e7C88C0A9a85148405F0636aF26959138  │     │
│  │                                                          │     │
│  │  • createProof(bytes32 hash, string name)               │     │
│  │  • verifyProof(bytes32 hash)                            │     │
│  │  • Stores proof data on-chain                           │     │
│  │  • Emits ProofCreated events                            │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Transaction Flow

```
USER ACTION: Click "Create Proof"
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND: Hash data locally (SHA-256)                   │
│    • Input: "Hello World"                                  │
│    • Output: 0xe5afbdbe8958e7bd9f35e2fc63bf7eb720024a35... │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: Encode function call                          │
│    • Function: createProof(hash, name)                     │
│    • ABI encoding via viem                                 │
│    • Output: callData (hex string)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PIMLICO: Fetch current gas prices                       │
│    • API call to Pimlico                                   │
│    • Returns: maxFeePerGas, maxPriorityFeePerGas          │
│    • Used for UserOperation construction                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PERMISSIONLESS: Create UserOperation                    │
│    • Sender: Smart Account address                         │
│    • Target: ProofOfExistence contract                     │
│    • CallData: Encoded function call                       │
│    • Gas prices: From Pimlico                              │
│    • Signature: Signed by embedded wallet                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PIMLICO BUNDLER: Bundle UserOperation                   │
│    • Validates UserOperation                               │
│    • Adds to bundle with other UserOps                     │
│    • Submits to EntryPoint contract                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. PIMLICO PAYMASTER: Sponsor gas fees                     │
│    • Verifies UserOperation is valid                       │
│    • Signs paymaster data                                  │
│    • Pays gas fees on behalf of user                       │
│    • User pays: 0 POL ✅                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ENTRYPOINT: Execute UserOperation                       │
│    • Validates signatures                                  │
│    • Checks paymaster approval                             │
│    • Calls Smart Account contract                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. SMART ACCOUNT: Execute transaction                      │
│    • Receives call from EntryPoint                         │
│    • Validates it's authorized                             │
│    • Calls ProofOfExistence contract                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. PROOFOFEXISTENCE: Store proof                           │
│    • Validates input (hash, name)                          │
│    • Stores: hash → (exists, timestamp, creator, name)     │
│    • Emits: ProofCreated event                             │
│    • Returns: Success                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. BLOCKCHAIN: Transaction confirmed                      │
│     • Block mined                                          │
│     • Transaction hash generated                           │
│     • Event logs recorded                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. FRONTEND: Display success                              │
│     • Show transaction hash                                │
│     • Show block explorer link                             │
│     • Display proof details                                │
│     • Navigate to success page                             │
└─────────────────────────────────────────────────────────────┘

TOTAL TIME: ~3-5 seconds
USER COST: $0.00 (gasless!)
```

## Data Flow Diagram

```
┌──────────────┐
│     USER     │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Login with Google/Email
       ▼
┌──────────────┐
│    PRIVY     │ ◄─── Handles authentication
│  (Auth API)  │      Creates embedded wallet
└──────┬───────┘
       │
       │ 2. Embedded wallet created
       ▼
┌──────────────────┐
│  PERMISSIONLESS  │ ◄─── Creates Smart Account
│   (AA Library)   │      from embedded wallet
└──────┬───────────┘
       │
       │ 3. Smart Account address
       ▼
┌──────────────┐
│   FRONTEND   │ ◄─── Stores Smart Account client
│  (React App) │      Ready for transactions
└──────┬───────┘
       │
       │ 4. User submits proof
       ▼
┌──────────────┐
│   PIMLICO    │ ◄─── Fetches gas prices
│  (Bundler)   │      Bundles UserOperation
└──────┬───────┘
       │
       │ 5. UserOperation bundled
       ▼
┌──────────────┐
│  ENTRYPOINT  │ ◄─── Validates & executes
│  (Contract)  │      on blockchain
└──────┬───────┘
       │
       │ 6. Calls Smart Account
       ▼
┌──────────────┐
│    SMART     │ ◄─── Executes transaction
│   ACCOUNT    │      to target contract
│  (Contract)  │
└──────┬───────┘
       │
       │ 7. Calls createProof()
       ▼
┌──────────────┐
│ PROOF OF     │ ◄─── Stores proof data
│  EXISTENCE   │      Emits event
│  (Contract)  │
└──────┬───────┘
       │
       │ 8. Transaction confirmed
       ▼
┌──────────────┐
│  BLOCKCHAIN  │ ◄─── Proof permanently
│  (Polygon)   │      recorded on-chain
└──────────────┘
```

## Component Relationships

```
App.jsx
  │
  ├─── Navbar.jsx
  │     └─── useSmartAccount() ◄─── Privy hooks
  │
  ├─── Home.jsx
  │
  ├─── CreateProof.jsx
  │     ├─── useSmartAccount() ◄─── Smart Account state
  │     └─── useGaslessProof() ◄─── Transaction logic
  │           ├─── nexusClient (from useSmartAccount)
  │           └─── pimlicoClient (from useSmartAccount)
  │
  ├─── VerifyProof.jsx
  │     └─── useSmartAccount()
  │
  ├─── Dashboard.jsx
  │     └─── useSmartAccount()
  │
  └─── ProofDetail.jsx
        └─── useSmartAccount()
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                        │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Privy State (Global)                     │     │
│  │  • authenticated: boolean                        │     │
│  │  • ready: boolean                                │     │
│  │  • user: { email, name, ... }                    │     │
│  │  • wallets: Wallet[]                             │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────┐     │
│  │      useSmartAccount State (Hook)                │     │
│  │  • smartAccountAddress: string                   │     │
│  │  • smartAccountClient: Client                    │     │
│  │  • pimlicoClient: PimlicoClient                  │     │
│  │  • loading: boolean                              │     │
│  │  • error: string | null                          │     │
│  │  • isReady: boolean                              │     │
│  └──────────────────┬───────────────────────────────┘     │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────┐     │
│  │      useGaslessProof State (Hook)                │     │
│  │  • loading: boolean                              │     │
│  │  • error: string | null                          │     │
│  │  • result: ProofResult | null                    │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                        │
│                                                             │
│  Layer 1: Authentication                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │  • Privy OAuth (Google/Email)                    │     │
│  │  • JWT tokens                                    │     │
│  │  • Session management                            │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Layer 2: Wallet Security                                  │
│  ┌──────────────────────────────────────────────────┐     │
│  │  • Embedded wallet (Privy-managed)               │     │
│  │  • Private keys never exposed                    │     │
│  │  • Encrypted storage                             │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Layer 3: Smart Account                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │  • Owned by embedded wallet                      │     │
│  │  • Programmable security policies                │     │
│  │  • Can add recovery mechanisms                   │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Layer 4: Transaction Validation                           │
│  ┌──────────────────────────────────────────────────┐     │
│  │  • EntryPoint validates signatures               │     │
│  │  • Paymaster verifies operations                 │     │
│  │  • Smart contract validates inputs               │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  Layer 5: Blockchain Immutability                          │
│  ┌──────────────────────────────────────────────────┐     │
│  │  • Transactions permanent on-chain               │     │
│  │  • Cryptographic proof of existence              │     │
│  │  • Tamper-proof audit trail                      │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**This architecture enables:**
- ✅ Gasless transactions (Pimlico sponsors)
- ✅ Social login (Privy handles auth)
- ✅ No MetaMask required (embedded wallets)
- ✅ Programmable security (Smart Accounts)
- ✅ Better UX (users don't need crypto)
