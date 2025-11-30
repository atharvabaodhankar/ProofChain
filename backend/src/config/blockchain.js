const { ethers } = require('ethers');

// Contract ABI (updated with creator name functionality)
const CONTRACT_ABI = [
  "event ProofCreated(bytes32 indexed dataHash, address indexed creator, string creatorName, uint256 timestamp, uint256 blockNumber)",
  "function createProof(bytes32 _dataHash, string memory _creatorName) external",
  "function verifyProof(bytes32 _dataHash) external view returns (bool exists, uint256 timestamp, string memory creatorName)",
  "function getProofTimestamp(bytes32 _dataHash) external view returns (uint256)",
  "function getProofCreatorName(bytes32 _dataHash) external view returns (string memory)",
  "function proofExists(bytes32) external view returns (bool)",
  "function proofTimestamp(bytes32) external view returns (uint256)",
  "function proofCreatorName(bytes32) external view returns (string memory)"
];

// Contract address (deployed on Sepolia with creator name functionality)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xd047c07FBABe11702d80dE0f1231245b6CCdB43e";

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialize();
  }

  initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Initialize contract
      if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
      }
      
      console.log('✅ Blockchain service initialized');
      console.log('📍 Wallet address:', this.wallet.address);
      console.log('🔗 Contract address:', CONTRACT_ADDRESS);
    } catch (error) {
      console.error('❌ Blockchain service initialization failed:', error.message);
      throw error;
    }
  }

  async getWalletBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error.message);
      throw error;
    }
  }

  async createProof(dataHash, creatorName) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please deploy the contract first.');
      }

      console.log('Creating proof for hash:', dataHash, 'by:', creatorName);
      
      // Convert string hash to bytes32 if needed
      const hashBytes32 = dataHash.startsWith('0x') ? dataHash : '0x' + dataHash;
      
      // Validate creator name
      if (!creatorName || creatorName.trim().length === 0) {
        throw new Error('Creator name is required');
      }
      
      if (creatorName.length > 100) {
        throw new Error('Creator name too long (max 100 characters)');
      }
      
      // Estimate gas
      const gasEstimate = await this.contract.createProof.estimateGas(hashBytes32, creatorName);
      console.log('Estimated gas:', gasEstimate.toString());
      
      // Send transaction
      const tx = await this.contract.createProof(hashBytes32, creatorName, {
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      // Parse events
      const proofCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ProofCreated';
        } catch {
          return false;
        }
      });
      
      let eventData = null;
      if (proofCreatedEvent) {
        const parsed = this.contract.interface.parseLog(proofCreatedEvent);
        eventData = {
          dataHash: parsed.args.dataHash,
          creator: parsed.args.creator,
          creatorName: parsed.args.creatorName,
          timestamp: Number(parsed.args.timestamp),
          blockNumber: Number(parsed.args.blockNumber)
        };
      }
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: eventData?.timestamp || Math.floor(Date.now() / 1000),
        creatorName: eventData?.creatorName || creatorName,
        eventData
      };
    } catch (error) {
      console.error('Error creating proof:', error.message);
      throw error;
    }
  }

  async verifyProof(dataHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please deploy the contract first.');
      }

      const hashBytes32 = dataHash.startsWith('0x') ? dataHash : '0x' + dataHash;
      
      const [exists, timestamp, creatorName] = await this.contract.verifyProof(hashBytes32);
      
      return {
        exists,
        timestamp: Number(timestamp),
        creatorName: creatorName || '',
        hash: dataHash
      };
    } catch (error) {
      console.error('Error verifying proof:', error.message);
      throw error;
    }
  }

  async getProofEvents(dataHash) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please deploy the contract first.');
      }

      const hashBytes32 = dataHash.startsWith('0x') ? dataHash : '0x' + dataHash;
      
      // Get current block number
      const currentBlock = await this.provider.getBlockNumber();
      
      // Limit the search to the last 10,000 blocks to avoid RPC limits
      const fromBlock = Math.max(0, currentBlock - 10000);
      
      // Query events with limited block range
      const filter = this.contract.filters.ProofCreated(hashBytes32);
      const events = await this.contract.queryFilter(filter, fromBlock, 'latest');
      
      return events.map(event => ({
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        dataHash: event.args.dataHash,
        creator: event.args.creator,
        creatorName: event.args.creatorName || '',
        timestamp: Number(event.args.timestamp),
        blockTimestamp: Number(event.args.blockNumber)
      }));
    } catch (error) {
      console.error('Error getting proof events:', error.message);
      throw error;
    }
  }
}

module.exports = new BlockchainService();