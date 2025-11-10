# Proof of Existence (PoE) System

A Web2-style application backed by blockchain that allows users to prove that a piece of data (text or file) existed at a specific point in time. Built with React, Node.js, and Ethereum smart contracts.

## Features

- **Blockchain Abstraction**: Users are unaware of blockchain usage
- **Privacy First**: Only hashes stored on-chain, no user data persisted
- **Firebase OAuth**: Secure authentication with Google Sign-In
- **Gasless Experience**: Backend pays all transaction fees
- **File & Text Support**: Prove existence of any content type
- **Immutable Timestamps**: Cryptographically secure proof of existence

## Architecture

```
Frontend (React + Firebase Auth)
    ↓ REST API
Backend (Node.js + Ethers.js)
    ↓ JSON-RPC
Sepolia Blockchain (Smart Contract)
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Sepolia testnet ETH for deployment

### 1. Clone and Install

```bash
git clone <repository-url>
cd proof-of-existence
npm install
```

### 2. Install Dependencies

```bash
# Install contract dependencies
cd contracts && npm install && cd ..

# Install backend dependencies  
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Setup

Copy `.env` file and update with your values:

```bash
# Update these values in .env:
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Firebase config (get from Firebase Console)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

Create `frontend/.env` from `frontend/.env.example` and add your Firebase config.

### 4. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Google provider
3. Get your config from Project Settings > General > Your apps
4. For backend, create a service account key:
   - Go to Project Settings > Service accounts
   - Generate new private key
   - Add the service account details to your `.env` file

### 5. Deploy Smart Contract

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address and update `CONTRACT_ADDRESS` in your `.env` file.

### 6. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## Usage

### Creating a Proof

1. Go to "Create Proof" page
2. Choose Text or File tab
3. Enter your content or upload a file
4. Click "Create Proof"
5. Save the returned hash and transaction details

### Verifying a Proof

1. Go to "Verify Proof" page  
2. Choose Text, File, or Hash tab
3. Enter the original content or hash
4. Click "Verify Proof"
5. View the verification results

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/me` - Get current user info

### Proof Operations
- `POST /api/proof/text` - Create proof from text
- `POST /api/proof/file` - Create proof from file
- `POST /api/proof/verify/text` - Verify text proof
- `POST /api/proof/verify/file` - Verify file proof
- `GET /api/proof/hash/:hash` - Get proof by hash
- `GET /api/proof/status` - Get blockchain status

## Smart Contract

The `ProofOfExistence.sol` contract:

- Stores proofs as events (gas efficient)
- Maps hashes to existence and timestamps
- Emits `ProofCreated` events for immutable logging
- Prevents duplicate proofs for same hash

## Security Considerations

- Private keys stored in environment variables
- No user content persisted on server
- Rate limiting on API endpoints
- Firebase token verification for authenticated routes
- Input validation and file size limits

## Deployment

### Production Environment

1. Set up production Firebase project
2. Deploy contract to mainnet (requires real ETH)
3. Update environment variables
4. Build and deploy:

```bash
npm run build
```

### Environment Variables

Required for production:
- `NODE_ENV=production`
- `CONTRACT_ADDRESS=deployed_contract_address`
- All Firebase configuration
- Production RPC URL and private key

## Development

### Project Structure

```
├── contracts/          # Smart contracts and deployment
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── config/     # Configuration files
│   │   └── middleware/ # Express middleware
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   └── config/     # Configuration
└── design.md          # System design document
```

### Adding Features

1. Update smart contract if needed
2. Add backend API endpoints
3. Create frontend components
4. Update authentication as required

## Troubleshooting

### Common Issues

1. **Contract not deployed**: Make sure to deploy the contract and update `CONTRACT_ADDRESS`
2. **Firebase auth errors**: Check Firebase configuration and service account setup
3. **Transaction failures**: Ensure wallet has sufficient Sepolia ETH
4. **CORS errors**: Check backend CORS configuration

### Logs

- Backend logs: Check console output when running `npm run dev:backend`
- Frontend logs: Check browser developer console
- Blockchain logs: Check Etherscan for transaction details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.