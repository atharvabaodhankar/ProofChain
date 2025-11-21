// Simple in-memory database for proofs
// In production, you'd use MongoDB, PostgreSQL, etc.

class ProofDatabase {
  constructor() {
    this.proofs = new Map(); // hash -> proof data
    this.userProofs = new Map(); // userId -> array of hashes
  }

  // Store a new proof
  storeProof(proofData) {
    const { hash, userId, userEmail, userName, transactionHash, blockNumber, timestamp, type, fileName, fileType, fileSize } = proofData;
    
    // Store proof data
    this.proofs.set(hash, {
      hash,
      userId,
      userEmail,
      userName,
      transactionHash,
      blockNumber,
      timestamp,
      type,
      fileName,
      fileType,
      fileSize,
      createdAt: new Date().toISOString()
    });

    // Add to user's proof list
    if (!this.userProofs.has(userId)) {
      this.userProofs.set(userId, []);
    }
    this.userProofs.get(userId).push(hash);

    console.log(`✅ Stored proof for user ${userName} (${userEmail})`);
  }

  // Get proof by hash
  getProofByHash(hash) {
    return this.proofs.get(hash) || null;
  }

  // Get all proofs for a user
  getUserProofs(userId) {
    const userHashes = this.userProofs.get(userId) || [];
    return userHashes.map(hash => this.proofs.get(hash)).filter(Boolean);
  }

  // Get proof with creator info for verification
  getProofWithCreator(hash) {
    const proof = this.proofs.get(hash);
    if (!proof) return null;

    return {
      ...proof,
      creatorName: proof.userName,
      creatorEmail: proof.userEmail
    };
  }

  // Get all proofs (for admin purposes)
  getAllProofs() {
    return Array.from(this.proofs.values());
  }

  // Get statistics
  getStats() {
    return {
      totalProofs: this.proofs.size,
      totalUsers: this.userProofs.size,
      proofsToday: Array.from(this.proofs.values()).filter(
        proof => new Date(proof.createdAt).toDateString() === new Date().toDateString()
      ).length
    };
  }
}

// Create singleton instance
const proofDB = new ProofDatabase();

module.exports = proofDB;