const { admin } = require('../config/firebase');

class FirestoreProofService {
  constructor() {
    this.db = null;
    this.initialize();
  }

  initialize() {
    try {
      this.db = admin.firestore();
      console.log('✅ Firestore proof service initialized');
    } catch (error) {
      console.error('❌ Firestore proof service initialization failed:', error.message);
      throw error;
    }
  }

  // Store a new proof in Firestore
  async storeProof(proofData) {
    try {
      const { hash, userId, userEmail, userName, transactionHash, blockNumber, timestamp, type, fileName, fileType, fileSize } = proofData;
      
      const proofDoc = {
        hash,
        userId,
        userEmail,
        userName,
        transactionHash,
        blockNumber,
        timestamp,
        type,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Store in proofs collection with hash as document ID
      await this.db.collection('proofs').doc(hash).set(proofDoc);

      // Also store in user's subcollection for easy querying
      await this.db.collection('users').doc(userId).collection('proofs').doc(hash).set({
        hash,
        transactionHash,
        blockNumber,
        timestamp,
        type,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Stored proof ${hash} for user ${userName} (${userEmail})`);
      return true;
    } catch (error) {
      console.error('Error storing proof in Firestore:', error.message);
      throw error;
    }
  }

  // Get proof by hash
  async getProofByHash(hash) {
    try {
      const doc = await this.db.collection('proofs').doc(hash).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting proof by hash:', error.message);
      throw error;
    }
  }

  // Get all proofs for a user
  async getUserProofs(userId, limit = 50, orderBy = 'createdAt', orderDirection = 'desc') {
    try {
      const snapshot = await this.db
        .collection('users')
        .doc(userId)
        .collection('proofs')
        .orderBy(orderBy, orderDirection)
        .limit(limit)
        .get();

      const proofs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        proofs.push({
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return proofs;
    } catch (error) {
      console.error('Error getting user proofs:', error.message);
      throw error;
    }
  }

  // Get proof with creator info for verification
  async getProofWithCreator(hash) {
    try {
      const proof = await this.getProofByHash(hash);
      if (!proof) return null;

      return {
        ...proof,
        creatorName: proof.userName,
        creatorEmail: proof.userEmail
      };
    } catch (error) {
      console.error('Error getting proof with creator:', error.message);
      throw error;
    }
  }

  // Get platform statistics
  async getStats() {
    try {
      // Get total proofs count
      const proofsSnapshot = await this.db.collection('proofs').count().get();
      const totalProofs = proofsSnapshot.data().count;

      // Get unique users count
      const usersSnapshot = await this.db.collection('users').count().get();
      const totalUsers = usersSnapshot.data().count;

      // Get proofs created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySnapshot = await this.db
        .collection('proofs')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
        .count()
        .get();
      const proofsToday = todaySnapshot.data().count;

      return {
        totalProofs,
        totalUsers,
        proofsToday
      };
    } catch (error) {
      console.error('Error getting stats:', error.message);
      // Return default stats if error
      return {
        totalProofs: 0,
        totalUsers: 0,
        proofsToday: 0
      };
    }
  }

  // Get recent proofs (for admin/public view)
  async getRecentProofs(limit = 10) {
    try {
      const snapshot = await this.db
        .collection('proofs')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const proofs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        proofs.push({
          hash: data.hash,
          userName: data.userName,
          type: data.type,
          fileName: data.fileName,
          timestamp: data.timestamp,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return proofs;
    } catch (error) {
      console.error('Error getting recent proofs:', error.message);
      return [];
    }
  }

  // Search proofs by user name or email (for admin purposes)
  async searchProofs(query, limit = 20) {
    try {
      const snapshot = await this.db
        .collection('proofs')
        .where('userName', '>=', query)
        .where('userName', '<=', query + '\uf8ff')
        .limit(limit)
        .get();

      const proofs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        proofs.push({
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      return proofs;
    } catch (error) {
      console.error('Error searching proofs:', error.message);
      return [];
    }
  }

  // Update user info in existing proofs (when user updates profile)
  async updateUserInfo(userId, newUserName, newUserEmail) {
    try {
      const batch = this.db.batch();
      
      // Get all proofs for this user
      const snapshot = await this.db
        .collection('proofs')
        .where('userId', '==', userId)
        .get();

      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          userName: newUserName,
          userEmail: newUserEmail,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`✅ Updated user info for ${snapshot.size} proofs`);
      return true;
    } catch (error) {
      console.error('Error updating user info:', error.message);
      throw error;
    }
  }

  // Delete all proofs for a user (GDPR compliance)
  async deleteUserProofs(userId) {
    try {
      const batch = this.db.batch();
      
      // Delete from main proofs collection
      const proofsSnapshot = await this.db
        .collection('proofs')
        .where('userId', '==', userId)
        .get();

      proofsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete user's subcollection
      const userProofsSnapshot = await this.db
        .collection('users')
        .doc(userId)
        .collection('proofs')
        .get();

      userProofsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Deleted ${proofsSnapshot.size} proofs for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting user proofs:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const firestoreProofService = new FirestoreProofService();

module.exports = firestoreProofService;