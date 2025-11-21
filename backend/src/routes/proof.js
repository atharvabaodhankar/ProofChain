const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const blockchainService = require('../config/blockchain');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const proofDB = require('../models/Proof');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for proof of existence
    cb(null, true);
  }
});

// Utility function to compute SHA-256 hash
const computeHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Create proof from text
router.post('/text', authenticateUser, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text content is required'
      });
    }
    
    if (text.length > 1000000) { // 1MB text limit
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text content too large (max 1MB)'
      });
    }
    
    // Compute hash
    const hash = computeHash(text);
    console.log('Creating proof for text hash:', hash);
    
    // Check if proof already exists in our database
    const existingProof = proofDB.getProofByHash(hash);
    if (existingProof) {
      return res.status(409).json({
        error: 'Conflict',
        message: `A proof for this content already exists, created by ${existingProof.userName}`,
        existingProof: {
          hash: existingProof.hash,
          createdBy: existingProof.userName,
          createdAt: existingProof.createdAt
        }
      });
    }
    
    // Create proof on blockchain
    const proofResult = await blockchainService.createProof(hash);
    
    // Store in our database with user info
    proofDB.storeProof({
      hash,
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: req.user.name || req.user.email.split('@')[0],
      transactionHash: proofResult.transactionHash,
      blockNumber: proofResult.blockNumber,
      timestamp: proofResult.timestamp,
      type: 'text'
    });
    
    res.json({
      success: true,
      proof: {
        hash,
        transactionHash: proofResult.transactionHash,
        blockNumber: proofResult.blockNumber,
        timestamp: proofResult.timestamp,
        gasUsed: proofResult.gasUsed,
        type: 'text',
        createdBy: req.user.name || req.user.email.split('@')[0],
        userEmail: req.user.email
      },
      message: 'Proof created successfully'
    });
    
  } catch (error) {
    console.error('Error creating text proof:', error.message);
    
    if (error.message.includes('Proof already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A proof for this content already exists on the blockchain'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create proof'
    });
  }
});

// Create proof from file
router.post('/file', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File is required'
      });
    }
    
    const { originalname, mimetype, size, buffer } = req.file;
    
    // Compute hash of file content
    const hash = computeHash(buffer);
    console.log(`Creating proof for file "${originalname}" (${mimetype}, ${size} bytes), hash:`, hash);
    
    // Create proof on blockchain
    const proofResult = await blockchainService.createProof(hash);
    
    res.json({
      success: true,
      proof: {
        hash,
        transactionHash: proofResult.transactionHash,
        blockNumber: proofResult.blockNumber,
        timestamp: proofResult.timestamp,
        gasUsed: proofResult.gasUsed,
        type: 'file',
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        user: req.user?.email || 'anonymous'
      },
      message: 'Proof created successfully'
    });
    
  } catch (error) {
    console.error('Error creating file proof:', error.message);
    
    if (error.message.includes('Proof already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A proof for this file already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create proof'
    });
  }
});

// Verify proof with text
router.post('/verify/text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text content is required'
      });
    }
    
    // Compute hash
    const hash = computeHash(text);
    
    // First check our database for creator info
    const proofData = proofDB.getProofWithCreator(hash);
    
    if (proofData) {
      // We have the proof in our database with creator info
      res.json({
        success: true,
        verified: true,
        proof: {
          hash: proofData.hash,
          timestamp: proofData.timestamp,
          blockNumber: proofData.blockNumber,
          transactionHash: proofData.transactionHash,
          creator: 'ProofChain User', // Since we use server wallet
          creatorName: proofData.creatorName,
          creatorEmail: proofData.creatorEmail,
          type: proofData.type,
          createdAt: proofData.createdAt
        },
        message: 'Proof verified successfully'
      });
    } else {
      // Check blockchain for older proofs (before database implementation)
      const verification = await blockchainService.verifyProof(hash);
      
      if (verification.exists) {
        const events = await blockchainService.getProofEvents(hash);
        const event = events[0];
        
        res.json({
          success: true,
          verified: true,
          proof: {
            hash,
            timestamp: verification.timestamp,
            blockNumber: event?.blockNumber,
            transactionHash: event?.transactionHash,
            creator: event?.creator,
            creatorName: 'Legacy User', // Old proofs before user tracking
            type: 'text'
          },
          message: 'Proof verified successfully (legacy proof)'
        });
      } else {
        res.json({
          success: true,
          verified: false,
          hash,
          message: 'No proof found for this content'
        });
      }
    }
    
  } catch (error) {
    console.error('Error verifying text proof:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify proof'
    });
  }
});

// Verify proof with file
router.post('/verify/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File is required'
      });
    }
    
    const { originalname, mimetype, size, buffer } = req.file;
    
    // Compute hash
    const hash = computeHash(buffer);
    
    // Verify on blockchain
    const verification = await blockchainService.verifyProof(hash);
    
    if (verification.exists) {
      // Get additional event data
      const events = await blockchainService.getProofEvents(hash);
      const event = events[0]; // Get the first (should be only) event
      
      res.json({
        success: true,
        verified: true,
        proof: {
          hash,
          timestamp: verification.timestamp,
          blockNumber: event?.blockNumber,
          transactionHash: event?.transactionHash,
          creator: event?.creator,
          creatorName: 'Anonymous User', // We'll enhance this later with a user mapping
          type: 'file',
          fileName: originalname,
          fileType: mimetype,
          fileSize: size
        },
        message: 'Proof verified successfully'
      });
    } else {
      res.json({
        success: true,
        verified: false,
        hash,
        fileName: originalname,
        message: 'No proof found for this file'
      });
    }
    
  } catch (error) {
    console.error('Error verifying file proof:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify proof'
    });
  }
});

// Get proof by hash
router.get('/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash || hash.length !== 64) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Valid SHA-256 hash is required'
      });
    }
    
    // Verify on blockchain
    const verification = await blockchainService.verifyProof(hash);
    
    if (verification.exists) {
      // Get additional event data
      const events = await blockchainService.getProofEvents(hash);
      const event = events[0];
      
      res.json({
        success: true,
        exists: true,
        proof: {
          hash,
          timestamp: verification.timestamp,
          blockNumber: event?.blockNumber,
          transactionHash: event?.transactionHash,
          creator: event?.creator,
          creatorName: 'Anonymous User' // We'll enhance this later with a user mapping
        }
      });
    } else {
      res.json({
        success: true,
        exists: false,
        hash,
        message: 'No proof found for this hash'
      });
    }
    
  } catch (error) {
    console.error('Error getting proof by hash:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get proof'
    });
  }
});

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const balance = await blockchainService.getWalletBalance();
    
    res.json({
      success: true,
      blockchain: {
        network: 'Sepolia Testnet',
        walletAddress: blockchainService.wallet.address,
        balance: `${balance} ETH`,
        contractAddress: process.env.CONTRACT_ADDRESS || 'Not deployed'
      }
    });
  } catch (error) {
    console.error('Error getting blockchain status:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get blockchain status'
    });
  }
});

// Get user's proof history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userProofs = proofDB.getUserProofs(req.user.uid);
    
    res.json({
      success: true,
      proofs: userProofs.map(proof => ({
        hash: proof.hash,
        type: proof.type,
        fileName: proof.fileName,
        transactionHash: proof.transactionHash,
        blockNumber: proof.blockNumber,
        timestamp: proof.timestamp,
        createdAt: proof.createdAt
      })),
      total: userProofs.length,
      message: 'History retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting user history:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user history'
    });
  }
});

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = proofDB.getStats();
    
    res.json({
      success: true,
      stats: {
        totalProofs: stats.totalProofs,
        totalUsers: stats.totalUsers,
        proofsToday: stats.proofsToday
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get statistics'
    });
  }
});

module.exports = router;