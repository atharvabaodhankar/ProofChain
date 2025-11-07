# Proof of Existence (PoE) – System Design

## 1. Overview

The **Proof of Existence (PoE)** system is a Web2-style application backed by blockchain that allows users to prove that a piece of data (text or file) existed at a specific point in time.

Key goals:
- Hide blockchain complexity from users
- No MetaMask or wallet interaction
- Gasless user experience
- Strong cryptographic proof
- Simple, auditable architecture

Only **hashes** are stored on-chain; original data is never persisted by the system.

---

## 2. Design Principles

- **Blockchain Abstraction**: Users are unaware of blockchain usage
- **Privacy First**: No user data stored on-chain or in DB
- **Immutability**: Proofs cannot be altered once written
- **Minimal On-Chain Data**: Events instead of storage
- **Separation of Concerns**: Frontend, backend, and blockchain clearly isolated

---

## 3. High-Level Architecture

```
User
  ↓
Frontend (React)
  ↓  REST API
Backend (Node.js + Ethers.js)
  ↓  JSON-RPC
Sepolia Blockchain (Smart Contract)
```

### Gas Payer
- Single backend-controlled relayer wallet
- Holds Sepolia test ETH
- Pays all transaction fees

---

## 4. Components

### 4.1 Frontend (Client Layer)

**Responsibilities:**
- Accept user input (text or file)
- Send content to backend
- Display proof results
- Provide verification interface

**Key Pages:**
- Generate Proof
- Verify Proof

**Not Included:**
- Wallet UI
- Blockchain terminology

---

### 4.2 Backend (Application Layer)

**Responsibilities:**
- Receive user content
- Compute cryptographic hash (SHA-256)
- Interact with smart contract
- Pay gas fees
- Return proof metadata

**Security:**
- Private key stored in environment variables
- No user content persisted

**Main APIs:**
- `POST /proof` – generate proof
- `POST /verify` – verify proof

---

### 4.3 Blockchain (Trust Layer)

**Network:**
- Ethereum Sepolia Testnet

**Responsibilities:**
- Immutable timestamping
- Public verifiability
- Event-based proof logging

**Stored Data:**
- Hash
- Timestamp
- Transaction metadata

---

## 5. Smart Contract Design

### Design Choice: Event-Based Storage

Instead of storing data in contract storage, the system emits events:
- Lower gas cost
- Immutable logs
- Easy indexing

**Event Structure:**
- Hash of content
- Block timestamp
- Relayer address

---

## 6. Data Flow

### 6.1 Proof Generation Flow

```
User Input
   ↓
Frontend
   ↓
Backend
   ├─ Compute SHA-256 hash
   ├─ Send transaction
   ↓
Blockchain Event Emitted
   ↓
Backend returns proof details
```

**Output to User:**
- Hash
- Transaction Hash
- Timestamp

---

### 6.2 Proof Verification Flow

```
User Uploads Original File
   ↓
Frontend
   ↓
Backend
   ├─ Recompute hash
   ├─ Fetch blockchain event
   ├─ Compare hashes
   ↓
Verification Result
```

---

## 7. Storage Strategy (Option A)

| Data | Storage Location |
|----|------------------|
| File / Text | User Device Only |
| Hash | Blockchain |
| Metadata | Returned to User |

No database is required in Version 1.

---

## 8. Threat Model & Trust Assumptions

### Trust Assumptions
- Blockchain is honest and immutable
- Cryptographic hash functions are secure

### Threat Mitigation
- Data privacy via hashing
- No sensitive data stored
- Backend rate limiting (future)

---

## 9. Scalability Considerations

### Current (MVP)
- Single relayer wallet
- Manual funding

### Future
- ERC-4337 Account Abstraction
- Paymaster contracts
- Multi-chain support
- IPFS integration

---

## 10. Limitations

- User must retain original file
- Backend is a temporary trust point
- Not suitable for large-scale mainnet usage without upgrades

---

## 11. Conclusion

This design provides a **simple, privacy-preserving, and production-inspired** approach to blockchain-backed proof systems. It demonstrates how Web3 infrastructure can be hidden behind familiar Web2 interfaces while retaining blockchain guarantees.

---

## 12. Future Enhancements

- IPFS / Arweave storage
- Proof certificate (PDF)
- OAuth login
- Dashboard
- Mainnet deployment
