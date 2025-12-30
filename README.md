# 🔗 ProofChain - Decentralized Proof of Existence

<div align="center">

![ProofChain Logo](frontend/public/ProofChain.png)

**Create immutable, timestamped proofs of your documents and digital assets using blockchain technology**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-proof--chain--app.vercel.app-blue?style=for-the-badge)](https://proof-chain-app.vercel.app)
[![Backend API](https://img.shields.io/badge/🚀_API-proofchain--c7ca.onrender.com-green?style=for-the-badge)](https://proofchain-c7ca.onrender.com/health)

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-627EEA?style=flat&logo=ethereum)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat&logo=firebase)

</div>

## ✨ Features

### 🔐 **Privacy-First Design**
- **Zero-Knowledge Architecture**: Only cryptographic hashes are stored on-chain
- **Local Processing**: Your original data never leaves your device
- **SHA-256 Hashing**: Industry-standard cryptographic fingerprinting

### 🚀 **Seamless User Experience**
- **Web2-Style Interface**: No crypto knowledge required
- **Gasless Transactions**: We handle all blockchain fees
- **Google OAuth**: Secure authentication with Firebase
- **Responsive Design**: Perfect on desktop and mobile

### ⛓️ **Blockchain-Powered Security**
- **Ethereum Integration**: Proofs stored on Sepolia testnet
- **Immutable Timestamps**: Cannot be altered or backdated
- **Smart Contract Verification**: Cryptographically verifiable proofs
- **Duplicate Prevention**: Automatic detection of existing proofs

### 📁 **Flexible Content Support**
- **Text Proofs**: Contracts, agreements, ideas, or any text content
- **File Proofs**: Documents, images, code, or any digital file (up to 10MB)
- **Hash Verification**: Direct verification using cryptographic hashes

### 🎨 **Modern Interface**
- **Glass Morphism Design**: Beautiful, modern UI with backdrop blur effects
- **Smooth Animations**: Page transitions and interactive elements
- **Real-time Timeline**: Visual blockchain transaction progress
- **Dark Theme**: Easy on the eyes with purple gradient accents

## 🏗️ Architecture

```mermaid
graph TB
    A[React Frontend] --> B[Express.js Backend]
    B --> C[Firebase Auth]
    B --> D[Ethereum Sepolia]
    B --> E[Firestore Database]
    D --> F[ProofOfExistence Contract]
    
    style A fill:#61DAFB
    style B fill:#339933
    style C fill:#FFCA28
    style D fill:#627EEA
    style E fill:#FFCA28
    style F fill:#627EEA
```

### Tech Stack

**Frontend**
- ⚛️ React 18 with Vite
- 🎨 Tailwind CSS + Glass Morphism
- 🔥 Firebase Authentication
- 🎭 Framer Motion animations
- 📱 Fully responsive design

**Backend**
- 🟢 Node.js + Express.js
- 🔗 Ethers.js for blockchain interaction
- 🔥 Firebase Admin SDK
- 🗄️ Firestore for metadata storage
- 🛡️ CORS + Rate limiting + Security headers

**Blockchain**
- ⛓️ Ethereum Sepolia testnet
- 📜 Solidity smart contracts
- 🔨 Hardhat development framework
- 🔍 Etherscan integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled
- Sepolia testnet ETH for deployment

### 1. Clone Repository

```bash
git clone https://github.com/atharvabaodhankar/ProofChain.git
cd ProofChain
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Install contract dependencies
cd contracts && npm install && cd ..

# Install backend dependencies  
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Setup

Create `.env` file in the root directory:

```env
# Blockchain Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_address
ETHERSCAN_API_KEY=your_etherscan_api_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Server Configuration
PORT=3001
NODE_ENV=development
```

Create `frontend/.env` file:

```env
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### 4. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication with Google provider

2. **Get Client Configuration**
   - Project Settings → General → Your apps
   - Add web app and copy config to `frontend/.env`

3. **Generate Service Account Key**
   - Project Settings → Service accounts
   - Generate new private key (JSON)
   - Add credentials to root `.env` file

### 5. Deploy Smart Contract

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address to your `.env` file.

### 6. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

Visit `http://localhost:3000` to see the application!

## 📖 Usage Guide

### Creating a Proof

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Choose Content Type**: Select Text or File tab
3. **Enter Content**: 
   - **Text**: Paste your content in the text area
   - **File**: Upload any file up to 10MB
4. **Generate Proof**: Click "Generate Proof" button
5. **Watch Progress**: Real-time blockchain timeline shows transaction progress
6. **Save Details**: Copy the hash and transaction ID for future verification

### Verifying a Proof

1. **Go to Verify Page**: No authentication required
2. **Choose Verification Method**:
   - **Text**: Enter the original text content
   - **File**: Upload the original file
   - **Hash**: Enter the cryptographic hash directly
3. **Verify**: Click "Verify Proof" button
4. **View Results**: See proof details, creator, and timestamp

### Viewing History

1. **Sign In**: Authentication required to view your proofs
2. **Dashboard**: See statistics and recent activity
3. **History Page**: Browse all your created proofs with search and filters
4. **Export**: Download your proof history as JSON

## 🔌 API Reference

### Authentication Endpoints

```http
POST /api/auth/verify
Authorization: Bearer <firebase-token>
```

### Proof Creation

```http
POST /api/proof/text
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "text": "Your content to prove"
}
```

```http
POST /api/proof/file
Content-Type: multipart/form-data
Authorization: Bearer <firebase-token>

file: <uploaded-file>
```

### Proof Verification

```http
POST /api/proof/verify/text
Content-Type: application/json

{
  "text": "Content to verify"
}
```

```http
POST /api/proof/verify/file
Content-Type: multipart/form-data

file: <file-to-verify>
```

### User Data

```http
GET /api/proof/history
Authorization: Bearer <firebase-token>
```

```http
GET /api/proof/stats
Authorization: Bearer <firebase-token>
```

## 📜 Smart Contract

The `ProofOfExistence.sol` contract provides:

```solidity
// Store a proof on the blockchain
function storeProof(string memory hash, string memory creatorName) public

// Check if a proof exists
function proofExists(string memory hash) public view returns (bool)

// Get proof details
function getProof(string memory hash) public view returns (ProofData memory)
```

**Key Features:**
- Gas-efficient storage using events
- Duplicate prevention
- Creator name storage for accountability
- Immutable timestamp recording

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add all `VITE_*` variables
3. **Build Settings**: 
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
4. **Deploy**: Automatic deployment on push to main

### Backend (Render)

1. **Create Web Service**: Connect your GitHub repo
2. **Settings**:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
3. **Environment Variables**: Add all backend environment variables
4. **Deploy**: Automatic deployment on push to main

### Smart Contract (Sepolia)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

Update `CONTRACT_ADDRESS` in environment variables after deployment.

## 🛡️ Security Features

- **🔐 Firebase Authentication**: Secure Google OAuth integration
- **🛡️ Rate Limiting**: API protection against abuse
- **🔒 CORS Configuration**: Proper cross-origin resource sharing
- **🚫 Input Validation**: File size limits and content validation
- **🔑 Private Key Security**: Environment-based key management
- **📝 Audit Trail**: Complete transaction history on blockchain

## 🎨 Design System

### Color Palette
- **Primary**: Purple to Violet gradient (`from-purple-600 to-violet-600`)
- **Secondary**: Indigo to Blue gradient (`from-indigo-600 to-blue-600`)
- **Success**: Green (`text-green-400`)
- **Background**: Dark slate with glass morphism effects

### Components
- **Glass Morphism**: `bg-white/10 backdrop-blur-md border border-white/20`
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Rounded corners with subtle shadows
- **Animations**: Smooth transitions and micro-interactions

## 📊 Project Structure

```
ProofChain/
├── 📁 contracts/              # Smart contracts
│   ├── contracts/ProofOfExistence.sol
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── 📁 backend/                # Node.js API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── config/           # Configuration
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Data models
│   │   └── services/         # Business logic
│   └── server.js
├── 📁 frontend/               # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── config/          # Configuration
│   ├── public/              # Static assets
│   └── index.html
└── 📄 README.md
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Troubleshooting

### Common Issues

**🔥 Firebase Authentication Errors**
```bash
# Check Firebase configuration
# Ensure service account key is properly formatted
# Verify project ID matches across all configs
```

**⛓️ Blockchain Connection Issues**
```bash
# Verify Sepolia RPC URL is working
# Check wallet has sufficient ETH for gas
# Confirm contract address is correct
```

**🌐 CORS Errors**
```bash
# Check backend CORS configuration
# Verify frontend URL is in allowed origins
# Ensure credentials are properly set
```

**📱 Build/Deployment Issues**
```bash
# Clear node_modules and reinstall
npm run clean && npm install

# Check environment variables are set
# Verify build commands in deployment settings
```

## 📈 Roadmap

- [ ] **Mainnet Deployment**: Move to Ethereum mainnet
- [ ] **Batch Operations**: Create multiple proofs in one transaction
- [ ] **API Keys**: Public API access for developers
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Detailed proof statistics and insights
- [ ] **Team Features**: Shared proof management for organizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** for blockchain infrastructure
- **Firebase** for authentication and database services
- **Vercel** and **Render** for hosting platforms
- **Open Source Community** for amazing tools and libraries

---

<div align="center">

**Built with ❤️ by [Atharva Baodhankar](https://github.com/atharvabaodhankar)**

[🌐 Live Demo](https://proof-chain-app.vercel.app) • [📚 Documentation](https://github.com/atharvabaodhankar/ProofChain) • [🐛 Report Bug](https://github.com/atharvabaodhankar/ProofChain/issues)

</div>