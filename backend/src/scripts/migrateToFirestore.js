/**
 * Migration script to move data from in-memory storage to Firestore
 * This is a one-time script for users who had data in the old system
 */

const { initializeFirebase } = require('../config/firebase');
const firestoreProofService = require('../services/firestoreProofService');

// Sample migration data - replace with actual data source
const sampleProofs = [
  {
    hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
    userId: 'sample-user-1',
    userEmail: 'user1@example.com',
    userName: 'Sample User 1',
    transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
    blockNumber: 12345678,
    timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    type: 'text'
  },
  {
    hash: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1',
    userId: 'sample-user-2',
    userEmail: 'user2@example.com',
    userName: 'Sample User 2',
    transactionHash: '0x2345678901bcdef12345678901bcdef123456789',
    blockNumber: 12345679,
    timestamp: Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
    type: 'file',
    fileName: 'document.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000
  }
];

async function migrateData() {
  try {
    console.log('🚀 Starting migration to Firestore...');
    
    // Initialize Firebase
    initializeFirebase();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const proof of sampleProofs) {
      try {
        await firestoreProofService.storeProof(proof);
        successCount++;
        console.log(`✅ Migrated proof: ${proof.hash.substring(0, 16)}...`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate proof ${proof.hash.substring(0, 16)}...:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} proofs`);
    console.log(`❌ Failed to migrate: ${errorCount} proofs`);
    console.log(`📈 Total processed: ${sampleProofs.length} proofs`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n🏁 Migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };